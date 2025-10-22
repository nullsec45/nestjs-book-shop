import { Controller, Get, Request, Patch, Res, Body, UseGuards } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { LoginUserRequest, RegisterUserRequest, UpdatePasswordRequest, UpdateUserRequest, UserResponse } from '../model/user.model';
import { WebResponse } from '@/model/web.model';
import { Auth } from '@/common/auth.decorator';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {Logger} from 'winston';
import { request } from 'http';

import { Response } from 'express'


@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(private userService:UserService){

    }

    @Get('my-profile')
    async get(
      @Res() response:Response,
      @Request() req  
    ){
        const result= await this.userService.myProfile(req.user.id);
        return response.status(result.statusCode).json(result);
    }

    @Patch('update-profile')
    async updateProfile(
      @Res() response:Response,
      @Request() req,
      @Body() request:UpdateUserRequest
    ){
        const result=await this.userService.update(request,req.user.id);
        return response.status(result.statusCode).json(result);
    }

    @Patch('update-password')
    async updatePassword(
      @Res() response:Response,
      @Request() req,
      @Body() request:UpdatePasswordRequest
    ){
        const result=await this.userService.updatePassword(request,req.user.id);
        return response.status(result.statusCode).json(result);
    }
    
}
