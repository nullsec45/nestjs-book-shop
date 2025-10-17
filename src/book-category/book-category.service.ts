import { Injectable, Inject,HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import { BookService } from '@/book/book.service';
import { CategoryService } from '@/category/category.service';
import {Logger} from 'winston';
import { CreateBookCategoryRequest, UpdateBookCategoryRequest, BookCategoryResponse } from '@/model/book-category.model';
import { Book, BookCategory, Prisma } from "@prisma/client";
import { BookCategoryValidation } from '@/book-category/book-category.validation';
import {responseValue, responseValueWithData, responseValueWithPaginate, } from '@/utils/response';
import { ResponseData } from '@/types/response';
// import { isUUID } from '@/utils/is-uuid';

@Injectable()
export class BookCategoryService {
    constructor(
        private validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private prismaService:PrismaService,
        private bookService:BookService,
        private categoryService:CategoryService,
    ){

    }

    private bookCategoryResponse(bookCategory:BookCategory):BookCategoryResponse{
        return {
            id:bookCategory.id,
            book_id:bookCategory.book_id,
            category_id:bookCategory.category_id,
        }
    }

    async checkBookCategoryMustExists(id:string):Promise<BookCategory>{  
        const bookCategory=await this.prismaService.bookCategory.findUnique({
            where: {
                id
            }
        });

        return bookCategory;
    }

    async isUnique(where: Prisma.BookCategoryWhereInput): Promise<boolean> {
        const found = await this.prismaService.bookCategory.findFirst({
            where,
            select: { id: true },
        });
        return !Boolean(found);
    }

    async create(
        request:CreateBookCategoryRequest
    ):Promise<ResponseData>{
        const createRequest:CreateBookCategoryRequest=this.validationService.validate(
            BookCategoryValidation.CREATE,
            request
        );

        const book=await this.bookService.checkBookMustExists(createRequest.book_id);

        if (!book) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
        }

        const category=await this.categoryService.checkCategoryMustExists(createRequest.category_id);

        if (!category) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Category Not Found');
        }
        
        if (!(await this.isUnique({ AND:[
            {book_id: request.book_id },
            {category_id:request.category_id},
        ] }))) {
            return responseValue(false, HttpStatus.CONFLICT, 'Book Category Already in Database');
        }

        const pivot=await this.prismaService.bookCategory.create({
            data:{
                book:{connect:{id:createRequest.book_id}},
                category:{connect:{id:createRequest.category_id}},
            },
        });

        const bookCategoryData=this.bookCategoryResponse(pivot);
        return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', bookCategoryData);
    }

    async update(
        request:UpdateBookCategoryRequest
    ):Promise<ResponseData>{
        const updateRequest=this.validationService.validate(BookCategoryValidation.UPDATE,request);
      

        let bookCategory=await this.checkBookCategoryMustExists(request.id);

        if (!bookCategory) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Category Not Found');
        }

        const book=await this.bookService.checkBookMustExists(updateRequest.book_id);

        if (!book) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
        }

        const category=await this.categoryService.checkCategoryMustExists(updateRequest.category_id);

        if (!category) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Category Not Found');
        }

        bookCategory=await this.prismaService.bookCategory.update({
            where:{
                id:bookCategory.id,
            },
            data:{
                book:{connect:{id:updateRequest.book_id}},
                category:{connect:{id:updateRequest.category_id}},
                updated_at:new Date()
            }
        })

        const bookCategoryData=this.bookCategoryResponse(bookCategory);

        return responseValueWithData(true, HttpStatus.OK, 'Successfully Updated Data', bookCategoryData);
    }

    async remove(bookCategoryId:string):Promise<ResponseData>{
        const checkBookCategory=await this.checkBookCategoryMustExists(bookCategoryId);

        if (!checkBookCategory) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Category Not Found');
        }

        await this.prismaService.bookCategory.delete({
            where:{
                id:bookCategoryId,
            },
        });

        return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
    }
}
