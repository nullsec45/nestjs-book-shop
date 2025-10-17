import { Controller,Post,HttpCode,Body, ParseIntPipe,Get,Param, Put, Delete, Query, UseGuards, Res} from "@nestjs/common";
import { BookService } from "@/book/book.service";
import { CreateBookCategoryRequest, SearchBookCategoryRequest, UpdateBookCategoryRequest } from "@/model/book-category.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { BookCategoryService } from "@/book-category/book-category.service";

@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard)
@Controller('book-category')
export class BookCategoryController {
    constructor(
        private bookCategoryService:BookCategoryService
    ){}

    @Post()
    async create(
        @Res() response:Response,
        @Body() request:CreateBookCategoryRequest,
    ) {
        const result= await this.bookCategoryService.create(request);
        return response.status(result.statusCode).json(result);
    }

    @Put('/:bookCategoryId')
    async update(
        @Res() response:Response,
        @Param('bookCategoryId') bookCategoryId:string,
        @Body() request:UpdateBookCategoryRequest,
    ){
        request.id=bookCategoryId;
        const result=await this.bookCategoryService.update(request);
        
        return response.status(result.statusCode).json(result);
    }

    @Delete('/:bookCategoryId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('bookCategoryId') bookCategoryId:string
    ){
        const result=await this.bookCategoryService.remove(bookCategoryId);
        
        return response.status(result.statusCode).json(result);
    }
}
