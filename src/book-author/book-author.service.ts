import { Injectable, Inject,HttpStatus, forwardRef } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import { BookService } from '@/book/book.service';
import { AuthorService } from '@/author/author.service';
import {Logger} from 'winston';
import { CreateBookAuthorRequest, UpdateBookAuthorRequest, BookAuthorResponse } from '@/model/book-author.model';
import {  BookAuthor, Prisma } from "@prisma/client";
import { BookAuthorValidation } from '@/book-author/book-author.validation';
import {responseValue, responseValueWithData, responseValueWithPaginate, } from '@/utils/response';
import { ResponseData } from '@/types/response';
// import { isUUID } from '@/utils/is-uuid';

@Injectable()
export class BookAuthorService {
    constructor(
        private validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private prismaService:PrismaService,
        private bookService:BookService,
        private authorService:AuthorService,
    ){
    
    }

    private bookAuthorResponse(bookAuthor:BookAuthor):BookAuthorResponse{
        return {
            id:bookAuthor.id,
            book_id:bookAuthor.book_id,
            author_id:bookAuthor.author_id,
            ord:bookAuthor.ord
        }
    }

    async checkBookAuthorMustExists(id:string):Promise<BookAuthor>{  
        const bookAuthor=await this.prismaService.bookAuthor.findUnique({
            where: {
                id
            }
        });

        return bookAuthor;
    }

    async isUnique(where: Prisma.BookAuthorWhereInput): Promise<boolean> {
        const found = await this.prismaService.bookAuthor.findFirst({
            where,
            select: { id: true },
        });
        return !Boolean(found);
    }

    async create(
        request:CreateBookAuthorRequest
    ):Promise<ResponseData>{
        const createRequest:CreateBookAuthorRequest=this.validationService.validate(
            BookAuthorValidation.CREATE,
            request
        );

        const book=await this.bookService.checkBookMustExists(createRequest.book_id);

        if (!book) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
        }

        const author=await this.authorService.checkAuthorMustExists(createRequest.author_id);

        if (!author) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Author Not Found');
        }
        
        if (!(await this.isUnique({ AND:[
            {book_id: request.book_id },
            {author_id:request.author_id},
        ] }))) {
            return responseValue(false, HttpStatus.CONFLICT, 'Book Author Already in Database');
        }

        const pivot=await this.prismaService.bookAuthor.create({
            data:{
                book:{connect:{id:createRequest.book_id}},
                author:{connect:{id:createRequest.author_id}},
                ord:createRequest.ord ?? null,
            },
        });

        const bookAuthorData=this.bookAuthorResponse(pivot);
        return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', bookAuthorData);
    }

    async update(
        request:UpdateBookAuthorRequest
    ):Promise<ResponseData>{
        console.log(request.id)
        let bookAuthor=await this.checkBookAuthorMustExists(request.id);

        if (!bookAuthor) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Author Not Found');
        }

        const updateRequest=this.validationService.validate(BookAuthorValidation.UPDATE,request);

        bookAuthor=await this.prismaService.bookAuthor.update({
            where:{
                id:bookAuthor.id,
            },
            data:{
                book:{connect:{id:updateRequest.book_id}},
                author:{connect:{id:updateRequest.author_id}},
                ord:updateRequest.ord ?? null,
                updated_at:new Date()
            }
        })

        const bookData=this.bookAuthorResponse(bookAuthor);

        return responseValueWithData(true, HttpStatus.OK, 'Successfully Updated Data', bookData);
    }

    async remove(bookAuthorId:string):Promise<ResponseData>{
        const checkBookAuthor=await this.checkBookAuthorMustExists(bookAuthorId);

        if (!checkBookAuthor) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Author Not Found');
        }

        await this.prismaService.bookAuthor.delete({
            where:{
                id:bookAuthorId,
            },
        });

        return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
    }
}
