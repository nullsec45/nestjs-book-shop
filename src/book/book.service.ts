import { Injectable, Inject,HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import {Logger} from 'winston';
import { BookResponse, CreateBookRequest, SearchBookRequest, UpdateBookRequest } from '@/model/book.model';
import { Book, Prisma } from "@prisma/client";
import { BookValidation } from '@/book/book.validation';
import { isUUID } from '@/utils/is-uuid';
import {responseValue, responseValueWithData, responseValueWithPaginate, } from '@/utils/response';
import { formateDate} from '@/utils/date';
import { ResponseData } from '@/types/response';
import { slugWithId } from "@/utils/generate-slug";

@Injectable()
export class BookService {
    constructor(
        private validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private prismaService:PrismaService,
    ){
    
    }

    private bookResponse(book:Book):BookResponse{
        return {
            id:book.id,
            slug:book.slug,
            isbn:book.isbn,
            title:book.title,
            description:book.description,
            price:book.price.toNumber(),
            pages:book.pages,
            language:book.language,
            publisher:book.publisher,
            published_at:book.published_at,
            stock_cached:book.stock_cached,
        }
    }

    async checkBookMustExists(param:string):Promise<Book>{  
        const where = isUUID(param) ? {id:param,deleted_at:null} : {slug:param, deleted_at:null};

        const book=await this.prismaService.book.findFirst({
            where: where as any,
        });


        return book;
    }

    async isUnique(where: Prisma.BookWhereInput): Promise<boolean> {
        const found = await this.prismaService.book.findFirst({
            where,
            select: { id: true },
        });
        return !Boolean(found);
    }

    async create(
        request:CreateBookRequest
    ):Promise<ResponseData>{
        request.slug=slugWithId(request.title || "", { uniqueStrategy: "time" });

        const createRequest:CreateBookRequest=this.validationService.validate(
            BookValidation.CREATE,
            request
        );
       
        if (!(await this.isUnique({ title: request.title }))) {
            return responseValue(false, HttpStatus.CONFLICT, 'Book Already in Database');
        }

        const book=await this.prismaService.book.create({
            data:{
                ...createRequest,
            }
        });

        const bookData=this.bookResponse(book);

        return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', bookData);
    }

    async search(request: SearchBookRequest): Promise<ResponseData> {
        const searchRequest: SearchBookRequest = this.validationService.validate(BookValidation.SEARCH, request);

        const filters: any[] = [];

        if (searchRequest.title) {
            filters.push({
            OR: [
                { first_name: { contains: searchRequest.title } },
                { last_name: { contains: searchRequest.title } },
            ],
            });
        }

        if (searchRequest.title) {
            filters.push({
            title: { contains: searchRequest.title },
            });
        }

        const perPage = Math.max(1, Number(searchRequest.size) || 10);
        const page = Math.max(1, Number(searchRequest.page) || 1);
        const skip = (page - 1) * perPage;

        const [books, total] = await Promise.all([
            this.prismaService.book.findMany({
            where: { 
                AND: filters,
                deleted_at: null
            },
            take: perPage,
            skip,
            // orderBy: { created_at: "desc" },
            }),
            this.prismaService.book.count({
            where: { AND: filters },
            }),
        ]);

        const items = books.map((book) => this.bookResponse(book));

        return responseValueWithPaginate(
            true,
            HttpStatus.OK,
            "Successfully Get Data Books",
            items,
            page,
            perPage,
            total
        );
    }

    async get(param:string):Promise<ResponseData>{
        const book=await this.checkBookMustExists(param);

        if (!book) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
        }

        const bookData=this.bookResponse(book);
        return responseValueWithData(true, HttpStatus.OK, 'Successfully Get Data', bookData);
    }

    async update(
        request:UpdateBookRequest
    ):Promise<ResponseData>{
        let book=await this.checkBookMustExists(request.id);

        if (!book) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
        }

        let slug=book.slug;
        
        if (slug !== request.slug) {
            slug=slugWithId(request.title || "", { uniqueStrategy: "time" });
            request.slug=slug;
        }

        const updateRequest=this.validationService.validate(BookValidation.UPDATE,request);


        book=await this.prismaService.book.update({
            where:{
                id:book.id,
            },
            data:{
                ...updateRequest,
                updated_at:new Date()
            }
        })

        const bookData=this.bookResponse(book);

        return responseValueWithData(true, HttpStatus.OK, 'Successfully Updated Data', bookData);
    }

    async remove(bookId:string):Promise<ResponseData>{
        const checkBook=await this.checkBookMustExists(bookId);

        if (!checkBook) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
        }

        await this.prismaService.book.update({
            where:{
                id:bookId,
            },
            data:{
                deleted_at:new Date()
            }
        });

        return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
    }
}
