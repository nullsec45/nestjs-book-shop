import {  Inject, Injectable, HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import {  AddressResponse, UpdatePasswordRequest, UpdateUserRequest, UserResponse } from '@/model/user.model';
import {Logger} from 'winston';
import { UserValidation } from '@/user/user.validation';
import * as bcrypt from 'bcrypt';
import { User, Prisma } from '@prisma/client';
import { ResponseData } from '@/types/response';
import {responseValue, responseValueWithData} from '@/utils/response';
import { ZodError } from 'zod';
import { Role } from '@/auth/role.enum';

type UserWithAddresses = Prisma.UserGetPayload<{ include: { addresses: true } }>;

@Injectable()
export class UserService {
    constructor(
        private readonly validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private readonly prismaService:PrismaService,
    ){

    }

    private addressResponse(a: any): AddressResponse {
        return {
            label: a.label,
            recipient_name: a.recipient_name,
            phone: a.phone,
            line: a.line,
            city: a.city,
            province: a.province,
            is_default: a.is_default,         
        };
    }


    private userResponse(data:any):UserResponse{
        return {
            name:data.name,
            username:data.username,
            email:data.email,
            addresses:  Array.isArray(data.addresses) ? data.addresses.map((a: any) => this.addressResponse(a)) : [],
        }
    }


    async checkUserMustExists(id:string, type:string='check'):Promise<User| UserWithAddresses | null>{  
        const [user] = await this.prismaService.$transaction([
            this.prismaService.user.findUnique({
                where: { id },
                include: type === 'detail' ? { addresses: true } : undefined,
            }),
        ]);

        return user;
    }

    async myProfile(
        id:string
    ):Promise<ResponseData>{
       try{
            const checkUser=await this.checkUserMustExists(id,'detail')
            if(!checkUser){
                return responseValue(false, HttpStatus.CONFLICT,'Unauthorized');
            }

            const userData:UserResponse=this.userResponse(checkUser);

            return responseValueWithData(true, HttpStatus.OK, 'Successfully get profile', userData);
       }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR,error.message ?? 'Internal server error');
       }
    }

    async updatePassword(
        request:UpdatePasswordRequest,
        id:string
    ):Promise<ResponseData>{
        try{
            const checkUser=await this.checkUserMustExists(id)
            if(!checkUser){
                return responseValue(false, HttpStatus.CONFLICT,'Unauthorized');
            }

            const updatePasswordRequest:UpdatePasswordRequest=this.validationService.validate(
                UserValidation.UPDATE_PASSWORD,
                request
            );

            const isPasswordValid=await bcrypt.compare(
                updatePasswordRequest.current_password,
                checkUser.password
            );

            if(!isPasswordValid){
                return responseValue(false, HttpStatus.UNAUTHORIZED, 'Unauthorized : password is invalid');
            }

            await this.prismaService.user.update({
                where:{
                    id
                },
                data:{
                    password:await bcrypt.hash(updatePasswordRequest.new_password,10),
                    updated_at:new Date()
                }
            });

            return responseValue(true, HttpStatus.OK, 'Successfully update password');
        }catch(error:any){
            if (error instanceof ZodError) {
                const details = error.issues.map(i => ({
                    path: i.path.join('.'),
                    code: i.code,
                    message: i.message,
                }));

                return {
                    status: false,
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    message: 'validation fail',
                    errors: details 
                } as ResponseData;
            }

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR,error.message ?? 'Internal server error.');
        }
    }

    async update(request:UpdateUserRequest, id:string):Promise<ResponseData>{
        try{
            const checkUser=await this.checkUserMustExists(id)
            if(!checkUser){
                return responseValue(false, HttpStatus.CONFLICT,'Unauthorized');
            }

            const updateRequest:UpdateUserRequest=this.validationService.validate(
                UserValidation.UPDATE,
                request
            );

            const result=await this.prismaService.user.update({
                where:{
                    id
                },
                data:{
                    ...request,
                    updated_at:new Date()
                }
            });
        
            const userData=this.userResponse(result);

            return responseValueWithData(true, HttpStatus.OK, 'Successfully update user', userData);
        }catch(error){
            if (error instanceof ZodError) {
                const details = error.issues.map(i => ({
                    path: i.path.join('.'),
                    code: i.code,
                    message: i.message,
                }));

                return {
                    status: false,
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    message: 'validation fail',
                    errors: details 
                } as ResponseData;
            }

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR,error.message ?? 'Internal server error');
        }
    }

    async getRoleByUserId(userId:string):Promise<Role>{
        const user=await this.prismaService.user.findUnique({
            where:{id:userId},
            select:{role:true},
        });

        return user.role as Role;
    }
}
