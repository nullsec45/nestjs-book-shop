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
import { VoucherService } from "@/voucher/voucher.service";
import { CreateVoucherRequest, SearchVoucherRequest, UpdateVoucherRequest } from "@/model/voucher.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { Role } from "@/auth/role.enum";
import { Roles } from "@/auth/roles.decorator";
import { RolesGuard } from "@/auth/roles.guard";
import { LogService } from "@/common/logger.service";
import { CurrentRole } from "@/auth/current-role.decorator";

@UseGuards(AuthenticatedGuard, JwtAuthGuard, RolesGuard)
@Controller('vouchers')
export class VoucherController {
    constructor(
        private readonly voucherService:VoucherService,
        private readonly logger:LogService,
    ){
        
    }

    @Roles(Role.ADMIN)
    @Post()
    @HttpCode(201)
    async create(
        @Res() response:Response,
        @Body() request:CreateVoucherRequest,
        @Req() req,
    ){
        request.upper_limit=Number(request.upper_limit);
        const result= await this.voucherService.create(request);
        
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
        @CurrentRole() role:Role,
        @Query('discount', new ParseIntPipe({optional:true})) discount?:number,
        @Query('upper_limit', new ParseIntPipe({optional:true})) upper_limit?:number,
        @Query('page',new ParseIntPipe({optional:true})) page?:number,
        @Query('size',new ParseIntPipe({optional:true})) size?:number,
    ){
        const request:SearchVoucherRequest={
            discount,
            upper_limit,
            page:page || 1,
            size:size || 10
        }

        const result=await this.voucherService.search(
            request,
            role !== 'ADMIN' ? req.user.id : null
        );

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
        @CurrentRole() role:Role,
    ){
        const result=await this.voucherService.get(
            id,
            role !== 'ADMIN' ? req.user.id : null
        );

        return response.status(result.statusCode).json(result);
    }

    @Roles(Role.ADMIN)
    @Put('/:id')
    @HttpCode(200)
    async update(
        @Res() response:Response,
        @Param('id') id:string,
        @Body() request:UpdateVoucherRequest,
        @Req() req,
    ){
        request.id=id;
        request.upper_limit=Number(request.upper_limit);
        const result=await this.voucherService.update(request);

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
        const result=await this.voucherService.remove(id);
        
        this.logger.module('access').info(result.message,{
            url:req.url,
            method:req.method,
            http_status:result.statusCode
        });

        return response.status(result.statusCode).json(result);
    }
}
