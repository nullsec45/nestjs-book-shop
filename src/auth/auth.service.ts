import { HttpException, Inject, Injectable, HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { LoginUserRequest, RegisterUserRequest, UpdateUserRequest, UserResponse } from '../model/user.model';
import {Logger} from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ResponseData } from '@/types/response';
import {responseValue, responseValueWithData} from '@/utils/response';
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private prismaService:PrismaService,
        private jwtService:JwtService
    ){

    }
    
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.prismaService.user.findUnique({where:{email}});
        if (!user) return null;

        const hashed=(user as any).password ?? (user as any).password_hash;
        const oke=await bcrypt.compare(password, hashed);
        if (!oke) return null;

        const {password:_p, password_hash:_ph, ...safeUser} = user as any;
        return safeUser;
    }

    async register(request:RegisterUserRequest):Promise<ResponseData>{
            const registerRequest=this.validationService.validate(UserValidation.REGISTER, request);

            const totalUserWithSameEmail=await this.prismaService.user.count({
                where:{
                    email:registerRequest.email
                }
            });

            if(totalUserWithSameEmail != 0){
                return responseValue(false, HttpStatus.CONFLICT, 'Account  already exists');
            }

            const totalUserWithSameUsername=await this.prismaService.user.count({
                where:{
                    username:registerRequest.username
                }
            });

            if(totalUserWithSameUsername != 0){
                return responseValue(false, HttpStatus.CONFLICT, 'Account  already exists');
            }

            registerRequest.password = await bcrypt.hash(registerRequest.password,10);

            const user=await this.prismaService.user.create({
                data:registerRequest
            });
            
            return responseValue(false, HttpStatus.CREATED, 'Successfully register');
    }

    async login(request:LoginUserRequest):Promise<ResponseData>{
        try {
            const loginRequest:LoginUserRequest=this.validationService.validate(
                UserValidation.LOGIN,
                request
            );

            let user=await this.prismaService.user.findUnique({
                where:{
                    email:loginRequest.email
                }
            });

            if(!user){
                return responseValue(false, HttpStatus.UNAUTHORIZED, 'Username or password is invalid');
            }

            const isPasswordValid=await bcrypt.compare(
                loginRequest.password,
                user.password
            );

            if(!isPasswordValid){
                // throw new HttpException('Username or password is invalid',401);
                return responseValue(false, HttpStatus.UNAUTHORIZED, 'Username or password is invalid');
            }

            let payload={name:user.name}
            let accessToken=this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: "60s"
            });
        
            return responseValueWithData(true,HttpStatus.OK, 'Success Login.', {
                accessToken:accessToken
            });
        }catch(error){
             return responseValue(false, HttpStatus.CONFLICT, error.message);
        }
    }


    async signToken(user: { id: string; email: string; role?: string; name?: string; username?: string }) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role ?? 'CUSTOMER',
            name: user.name,
            username: user.username,
        };
        return this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '60s',
        });
    }

    // async get(user:User):Promise<UserResponse>{
    //     return {
    //         email:user.email,
    //         role:user.role
    //     }
    // }

    async update(user:User, request:UpdateUserRequest):Promise<UserResponse>{
        const updateRequest:UpdateUserRequest=this.validationService.validate(
            UserValidation.UPDATE,
            request
        );

        if(updateRequest.email){
            user.email=updateRequest.email;
        }

        if(updateRequest.password){
            user.password=await bcrypt.hash(updateRequest.password,10);
        }

        const result=await this.prismaService.user.update({
            where:{
                username:user.username
            },
            data:user
        });

        return {
            email:result.email,
            role:result.role
        }
    }

    // async logout(user:User):Promise<UserResponse>{
    //     const result=await this.prismaService.user.update({
    //         where:{
    //             role:user.role
    //         },
    //         data:{
    //             token:null
    //         }
    //     })

    //     return {
    //         email:result.email,
    //         role:result.role,
    //     }
    // }
}
