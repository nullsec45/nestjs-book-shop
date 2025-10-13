import { Controller,Post,HttpCode,Body, ParseIntPipe,Get,Param, Put, Delete, Query, UseGuards, Res} from "@nestjs/common";
import { BookService } from "@/book/book.service";
import { CreateBookRequest, SearchBookRequest, UpdateBookRequest } from "@/model/book.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'

@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BookController {
    constructor(
        private bookService:BookService
    ){}

    @Post()
    async create(
        @Body() request:CreateBookRequest
    ){
        const result= await this.bookService.create(request);
        return {
            data:result
        }
    }

    @Get('/:param')
    @HttpCode(200)
    async get(
        @Res() response:Response,
        @Param('param') param:string
    ){
        const result=await this.bookService.get(param);

        return response.status(result.statusCode).json(result);
    }

    @Put('/:bookId')
    @HttpCode(200)
    async update(
        @Res() response:Response,
        @Param('bookId') bookId:string,
        @Body() request:UpdateBookRequest
    ){
        request.id=bookId;
        const result=await this.bookService.update(request);
        
        return response.status(result.statusCode).json(result);
    }

    @Delete('/:bookId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('bookId') bookId:string
    ){
        const result=await this.bookService.remove(bookId);
        
        return response.status(result.statusCode).json(result);
    }

    @Get()
    @HttpCode(200)
    async search(
        @Res() response:Response,
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

        
        return response.status(result.statusCode).json(result);

    }
}
