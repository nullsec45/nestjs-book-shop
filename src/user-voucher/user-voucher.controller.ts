import { 
    Controller,
    Post,
    HttpCode,
    Body, 
    ParseIntPipe,
    Get,
    Param, 
    Put, 
    Delete, 
    Query, 
    UseGuards, 
    Res,
    Req
} from "@nestjs/common";
import { UserVoucherService } from "@/user-voucher/user-voucher.service";
import { UserService } from "@/user/user.service";
import { CreateUserVoucherRequest, SearchUserVoucherRequest, UpdateUserVoucherRequest } from "@/model/user-voucher.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { Role } from "@/auth/role.enum";
import { Roles } from "@/auth/roles.decorator";
import { RolesGuard } from "@/auth/roles.guard";
import { LogService } from "@/common/logger.service";

@UseGuards(AuthenticatedGuard, JwtAuthGuard, RolesGuard)
@Controller('user-vouchers')
export class UserVoucherController {
    constructor(
        private readonly userVoucherService:UserVoucherService,
        private readonly logger:LogService,
        private readonly userService:UserService,
    ){
        
    }

    @Roles(Role.ADMIN)
    @Post()
    @HttpCode(201)
    async create(
        @Res() response:Response,
        @Body() request:CreateUserVoucherRequest,
        @Req() req,
    ){
        const result= await this.userVoucherService.create(request);
        
        this.logger.module('access').info(result.message,{
            url:req.url,
            method:req.method,
            http_status:result.statusCode
        });

        return response.status(result.statusCode).json(result);
    }

    @Get()
    @HttpCode(200)
    async search(
        @Res() response:Response,
        @Req() req,
        @Query('page',new ParseIntPipe({optional:true})) page?:number,
        @Query('size',new ParseIntPipe({optional:true})) size?:number,
    ){
        const request:SearchUserVoucherRequest={
            page:page || 1,
            size:size || 10
        }

        const result=await this.userVoucherService.search(request);

        this.logger.module('access').info(result.message,{
            url:req.url,
            method:req.method,
            http_status:result.statusCode
        });

        
        return response.status(result.statusCode).json(result);
    }

    @Get('/:id')
    @HttpCode(200)
    async get(
        @Res() response:Response,
        @Param('id') id:string,
        @Req() req,
    ){
        const result=await this.userVoucherService.get(id);

        return response.status(result.statusCode).json(result);
    }

    @Roles(Role.ADMIN)
    @Put('/:id')
    @HttpCode(200)
    async update(
        @Res() response:Response,
        @Param('id') id:string,
        @Body() request:UpdateUserVoucherRequest,
        @Req() req,
    ){
        request.id=id;
        const result=await this.userVoucherService.update(request);

        this.logger.module('access').info(result.message,{
            url:req.url,
            method:req.method,
            http_status:result.statusCode
        });
        
        return response.status(result.statusCode).json(result);
    }

    @Roles(Role.ADMIN)
    @Delete('/:id')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('id') id:string,
        @Req() req,
    ){
        const result=await this.userVoucherService.remove(id);
        
        this.logger.module('access').info(result.message,{
            url:req.url,
            method:req.method,
            http_status:result.statusCode
        });

        return response.status(result.statusCode).json(result);
    }
}
