import { Injectable, Inject,HttpStatus,forwardRef } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import {Logger} from 'winston';
import { BookResponse, CreateBookRequest, SearchBookRequest, UpdateBookRequest } from '@/model/book.model';
import { Book, Category, Prisma, Author } from "@prisma/client";
import { BookValidation } from '@/book/book.validation';
import { isUUID } from '@/utils/is-uuid';
import {responseValue, responseValueWithData, responseValueWithPaginate, } from '@/utils/response';
import { ResponseData } from '@/types/response';
import { slugWithId } from "@/utils/generate-slug";
import { ZodError } from 'zod';
import { CategoryResponse } from '@/model/category.model';
import { AuthorResponse } from '@/model/author.model';
import { MediaService } from '@/media/media.service';
import { MediaResponse } from '@/model/media.model';

type BookWithCategories = Prisma.BookGetPayload<{ 
    include: { 
        book_categories:{
            include:{category:true}
        }
    } 
}>;

@Injectable()
export class BookService {
    constructor(
        private readonly validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private readonly prismaService:PrismaService,
        @Inject(forwardRef(() => MediaService))
        private readonly mediaService: MediaService,
    ){
    
    }

    private categoryResponse(data:Category):CategoryResponse{
        return {
            id:data.id,
            slug:data.slug,
            name:data.name,
            description: data.description,
        }
    }

    private authorResposne(data:Author):AuthorResponse{
        return {
            id:data.id,
            slug:data.slug,
            name:data.name,
            bio:data.bio,
        }
    }

    private bookResponse(book:any, cover?:MediaResponse):BookResponse{
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
            categories:Array.isArray(book.book_categories) ? book.book_categories.map((bc: any) => bc?.category).filter(Boolean).map((c:any) => this.categoryResponse(c)) : [],
            authors:Array.isArray(book.book_authors) ? book.book_authors.map((ba: any) => ba?.author).filter(Boolean).map((a:any) => this.authorResposne(a)) : [],
            cover: cover,
        }
    }

    async checkBookMustExists(param:string, type:string='check'):Promise<Book | BookWithCategories | null>{  
        const where = isUUID(param) ? {id:param,deleted_at:null} : {slug:param, deleted_at:null};

        const [book]=await this.prismaService.$transaction([
            this.prismaService.book.findFirst({
               where: where as any,
               include:type === 'detail' ? {
                    book_categories:{
                        include:{category:true}
                    },
                    book_authors:{
                        include:{author:true}
                    }

               } : undefined
            })
        ]);

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
        try{
            request.slug=slugWithId(request.title || "", { uniqueStrategy: "time" });

            const createRequest:CreateBookRequest=this.validationService.validate(
                BookValidation.CREATE,
                request
            );
        
            if (!(await this.isUnique({ AND:[{title: request.title},{deleted_at:null}]}  ))) {
                return responseValue(false, HttpStatus.CONFLICT, 'Book Already in Database');
            }

            if (!(await this.isUnique({ AND:[{isbn: request.isbn},{deleted_at:null}]}  ))) {
                return responseValue(false, HttpStatus.CONFLICT, 'Book Already in Database');
            }

            const book=await this.prismaService.book.create({
                data:{
                    ...createRequest,
                }
            });

            const bookData=this.bookResponse(book);

            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', bookData);
        }catch(error){
            if (error instanceof ZodError) {
                const details = error.issues.map(i => ({
                    path: i.path.join('.'),
                    code: i.code,
                    message: i.message,
                }));

                return {
                    status: false,
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    message: 'validation fail',
                    errors: details 
                } as ResponseData;
            }

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async search(request: SearchBookRequest): Promise<ResponseData> {
        try{
            const searchRequest: SearchBookRequest = this.validationService.validate(BookValidation.SEARCH, request);

            const filters: any[] = [];

            if (searchRequest.title) {
                filters.push({
                OR: [
                    { title: { contains: searchRequest.title } },
                    { publisher: { contains: searchRequest.title } },
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
                    include:{
                        book_categories:{
                            take:3,
                            include:{
                                category:{
                                    select:{
                                        id:true,
                                        slug:true,
                                        name:true,
                                    },
                                }
                            },
                        },
                        book_authors:{
                            include:{
                                author:{
                                     select:{
                                        id:true,
                                        slug:true,
                                        name:true,
                                    },
                                }
                            }
                        }
                    }
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
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async get(param:string):Promise<ResponseData>{
        try{
            const book=await this.checkBookMustExists(param, 'detail');

            if (!book) {
                return responseValue(false, HttpStatus.NOT_FOUND, 'Book Not Found');
            }

            const coverMedia=await this.mediaService.findOneByParent(book.id, 'book_cover');

            const bookData:BookResponse=this.bookResponse(book, coverMedia as MediaResponse | undefined);
            return responseValueWithData(true, HttpStatus.OK, 'Successfully Get Data', bookData);
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async update(
        request:UpdateBookRequest
    ):Promise<ResponseData>{
        try{
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
        }catch(error){
            if (error instanceof ZodError) {
                const details = error.issues.map(i => ({
                    path: i.path.join('.'),
                    code: i.code,
                    message: i.message,
                }));

                return {
                    status: false,
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    message: 'validation fail',
                    errors: details 
                } as ResponseData;
            }

            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async remove(bookId:string):Promise<ResponseData>{
        try{
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
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }
}
