import {  Inject, Injectable, HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { LoginUserRequest, RegisterUserRequest, UpdateUserRequest, UserResponse } from '../model/user.model';
import {Logger} from 'winston';
import { UserValidation } from './auth.validation';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ResponseData } from '@/types/response';
import {responseValue, responseValueWithData} from '@/utils/response';
import { ZodError } from 'zod';

@Injectable()
export class AuthService {
    constructor(
        private validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private prismaService:PrismaService,
        private jwtService:JwtService
    ){

    }

    async checkUserMustExists(id:string):Promise<User>{  
        const user=await this.prismaService.user.findFirst({
            where: {
                id
            },
        });


        return user;
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
        try{
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
            
            return responseValue(true, HttpStatus.CREATED, 'Successfully register');
        }catch(error){
            if (error instanceof ZodError) {
                const details = error.issues.map(i => ({
                    path: i.path.join('.'),
                    code: i.code,
                    message: i.message,
                }));

                return {
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'validation fail',
                    error: details 
                } as ResponseData;
            }

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR,error.message ?? 'Internal server error.');
        }
      
    }

    async login(request:LoginUserRequest):Promise<ResponseData>{
        try {
            const loginRequest:LoginUserRequest=this.validationService.validate(
                UserValidation.LOGIN,
                request
            );

            let user=await this.prismaService.user.findUnique({
                select:{
                    id:true,
                    name:true,
                    password:true,
                },
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
                return responseValue(false, HttpStatus.UNAUTHORIZED, 'Username or password is invalid');
            }

            let payload={id:user.id}
            let accessToken=this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: "1h"
            });

            const expiry = new Date(Date.now() + 60 * 60 * 1000);
            const fmt = new Intl.DateTimeFormat('sv-SE', {
                timeZone: 'Asia/Jakarta',
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false,
            });
        
            const jakarta = fmt.format(expiry).replace(' ', 'T');
            const tokenExpiredAt = `${jakarta}+07:00`;

            // const tokenExpiredAt=new Date(Date.now() + 60 * 60 * 1000).toISOString();
            const tokenExpiredAtEpoch = Math.floor(Date.now() / 1000) + 3600;

            return responseValueWithData(true,HttpStatus.OK, 'Successfully Login.', {
                accessToken:accessToken,
                tokenExpiredAt:tokenExpiredAt,
            });
        }catch(error){
            if (error instanceof ZodError) {
                const details = error.issues.map(i => ({
                    path: i.path.join('.'),
                    code: i.code,
                    message: i.message,
                }));

                return {
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'validation fail',
                    error: details 
                } as ResponseData;
            }

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
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
}
