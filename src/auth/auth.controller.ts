import { Controller, Get, Post, UseGuards, Request, Body, Res, Req } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { LoginUserRequest, RegisterUserRequest, UpdateUserRequest, UserResponse } from '@/model/user.model';

import { Response } from 'express'
import { LogService } from '@/common/logger.service';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger:LogService,
  ) { }

  @Post('/register')
    async register(
      @Body() request:RegisterUserRequest,
      @Res() response:Response,
      @Req() req,
    ){
      const result=await this.authService.register(request);
      this.logger.module('access').info({
        url:req.url,
        method:req.method,
        http_status:result.statusCode
      });

      return response.status(result.statusCode).json(result);
    }


  // @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @Body() request:LoginUserRequest,
    @Res() response:Response,
    @Req() req,
  ){
    const result=await this.authService.login(request);
    
    this.logger.module('access').info(result.message,{
        url:req.url,
        method:req.method,
        http_status:result.statusCode
    });

    return response.status(result.statusCode).json(result);
  }

  @UseGuards(AuthenticatedGuard)
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getHello(@Request() req): string {
    return req.user;
  }
}
