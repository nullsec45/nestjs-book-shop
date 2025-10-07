import { Controller, Get, Post, UseGuards, Request, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthenticatedGuard } from './authenticated.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginUserRequest, RegisterUserRequest, UpdateUserRequest, UserResponse } from '../model/user.model';
import { WebResponse } from '../model/web.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {Logger} from 'winston';
import { request } from 'http';

import { Response } from 'express'


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/register')
    async register(
      @Body() request:RegisterUserRequest,
      @Res() response:Response,
    ){
      const result=await this.authService.register(request);

      return response.status(result.statusCode).json(result);
    }


  // @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @Body() request:LoginUserRequest,
    @Res() response:Response,
  ){
    const result=await this.authService.login(request);

    return response.status(result.statusCode).json(result);
  }

  @UseGuards(AuthenticatedGuard)
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getHello(@Request() req): string {
    return req.user;
  }
}
