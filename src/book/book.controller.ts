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
import { BookService } from "@/book/book.service";
import { CreateBookRequest, SearchBookRequest, UpdateBookRequest } from "@/model/book.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { Role } from "@/auth/role.enum";
import { Roles } from "@/auth/roles.decorator";
import { RolesGuard } from "@/auth/roles.guard";
import { LogService } from "@/common/logger.service";

@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('books')
export class BookController {
    constructor(
        private bookService:BookService,
        private logger:LogService,
    ){}

    @Roles(Role.ADMIN)
    @Post()
    @HttpCode(201)
    async create(
        @Res() response:Response,
        @Body() request:CreateBookRequest,
        @Req() req,
    ){
        const result= await this.bookService.create(request);

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
        @Query('title') title?:string,
        @Query('page',new ParseIntPipe({optional:true})) page?:number,
        @Query('size',new ParseIntPipe({optional:true})) size?:number,
    ){
        const request:SearchBookRequest={
            title,
            page:page || 1,
            size:size || 10
        }

        const result=await this.bookService.search(request);

        this.logger.module('access').info(result.message,{
            url:req.url,
            method:req.method,
            http_status:result.statusCode
        });

        
        return response.status(result.statusCode).json(result);

    }

    @Get('/:param')
    @HttpCode(200)
    async get(
        @Res() response:Response,
        @Param('param') param:string,
        @Req() req,
    ){
        const result=await this.bookService.get(param);

        return response.status(result.statusCode).json(result);
    }

    @Roles(Role.ADMIN)
    @Put('/:bookId')
    @HttpCode(200)
    async update(
        @Res() response:Response,
        @Param('bookId') bookId:string,
        @Body() request:UpdateBookRequest,
        @Req() req,
    ){
        request.id=bookId;
        const result=await this.bookService.update(request);

        this.logger.module('access').info(result.message,{
            url:req.url,
            method:req.method,
            http_status:result.statusCode
        });
        
        return response.status(result.statusCode).json(result);
    }

    @Roles(Role.ADMIN)
    @Delete('/:bookId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('bookId') bookId:string,
        @Req() req,
    ){
        const result=await this.bookService.remove(bookId);
        
        this.logger.module('access').info(result.message,{
            url:req.url,
            method:req.method,
            http_status:result.statusCode
        });

        return response.status(result.statusCode).json(result);
    }
}
