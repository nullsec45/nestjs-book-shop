import { Controller,Post,HttpCode,Body, ParseIntPipe,Get,Param, Put, Delete, Query, UseGuards, Res} from "@nestjs/common";
import { BookService } from "@/book/book.service";
import { CreateBookAuthorRequest, SearchBookAuthorRequest, UpdateBookAuthorRequest } from "@/model/book-author.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { BookAuthorService } from "@/book-author/book-author.service";
import { Roles } from "@/auth/roles.decorator";
import { Role } from "@/auth/role.enum";
import { RolesGuard } from "@/auth/roles.guard";

@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('book-author')
export class BookAuthorController {
    constructor(
        private bookAuthorService:BookAuthorService
    ){}

    @Post()
    async create(
        @Res() response:Response,
        @Body() request:CreateBookAuthorRequest,
    ) {
        const result= await this.bookAuthorService.create(request);
        return response.status(result.statusCode).json(result);
    }

    @Put('/:bookAuthorId')
    async update(
        @Res() response:Response,
        @Param('bookAuthorId') bookAuthorId:string,
        @Body() request:UpdateBookAuthorRequest,
    ){
        request.id=bookAuthorId;
        const result=await this.bookAuthorService.update(request);
        
        return response.status(result.statusCode).json(result);
    }

    @Delete('/:bookAuthorId')
    @HttpCode(200)
    async remove(
        @Res() response:Response,
        @Param('bookAuthorId') bookAuthorId:string
    ){
        const result=await this.bookAuthorService.remove(bookAuthorId);
        
        return response.status(result.statusCode).json(result);
    }
}
