import { Injectable, Inject,HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import {Logger} from 'winston';
import { AuthorResponse, CreateAuthorRequest, SearchAuthorRequest, UpdateAuthorRequest } from '@/model/author.model';
import { Author,Prisma } from "@prisma/client";
import { AuthorValidation } from '@/author/author.validation';
import { isUUID } from '@/utils/is-uuid';
import {responseValue, responseValueWithData, responseValueWithPaginate} from '@/utils/response';
import { ResponseData } from '@/types/response';
import { slugWithId } from "@/utils/generate-slug";

@Injectable()
export class AuthorService {
    constructor(
        private validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private prismaService:PrismaService,
    ){
    
    }

    private authorResponse(author:Author):AuthorResponse{
        return {
            id:author.id,
            slug:author.slug,
            name:author.name,
            bio:author.bio,
        }
    }

    async checkAuthorMustExists(param:string):Promise<Author>{  
        const where = isUUID(param) ? {id:param,deleted_at:null} : {slug:param, deleted_at:null};

        const author=await this.prismaService.author.findFirst({
            where: where as any,
        });


        return author;
    }

    async isUnique(where: Prisma.AuthorWhereInput): Promise<boolean> {
        const found = await this.prismaService.author.findFirst({
            where,
            select: { id: true },
        });
        return !Boolean(found);
    }

    async create(
        request:CreateAuthorRequest
    ):Promise<ResponseData>{
        request.slug=slugWithId(request.name || "", { uniqueStrategy: "time" });
        const createRequest:CreateAuthorRequest=this.validationService.validate(
            AuthorValidation.CREATE,
            request
        );

        if (!(await this.isUnique({ name: request.name }))) {
            return responseValue(false, HttpStatus.CONFLICT, 'Author Already in Database');
        }

        const author=await this.prismaService.author.create({
            data:{
                ...createRequest,
            }
        });

        const authorData=this.authorResponse(author);

        return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Created Data', authorData);
    }

    async search(request: SearchAuthorRequest): Promise<ResponseData> {
        const searchRequest: SearchAuthorRequest = this.validationService.validate(AuthorValidation.SEARCH, request);

        const filters: any[] = [];

        if (searchRequest.name) {
            filters.push({
            OR: [
                { first_name: { contains: searchRequest.name } },
                { last_name: { contains: searchRequest.name } },
            ],
            });
        }

        if (searchRequest.name) {
            filters.push({
            name: { contains: searchRequest.name },
            });
        }

        const perPage = Math.max(1, Number(searchRequest.size) || 10);
        const page = Math.max(1, Number(searchRequest.page) || 1);
        const skip = (page - 1) * perPage;

        const [authors, total] = await Promise.all([
            this.prismaService.author.findMany({
            where: { 
                AND: filters,
                deleted_at: null
            },
            take: perPage,
            skip,
            // orderBy: { created_at: "desc" },
            }),
            this.prismaService.author.count({
            where: { AND: filters },
            }),
        ]);

        const items = authors.map((author) => this.authorResponse(author));

        return responseValueWithPaginate(
            true,
            HttpStatus.OK,
            "Successfully Get Data Authors.",
            items,
            page,
            perPage,
            total
        );
    }

    async get(param:string):Promise<ResponseData>{
        const author=await this.checkAuthorMustExists(param);

        if (!author) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Author Not Found');
        }

        const authorData=this.authorResponse(author);
        return responseValueWithData(true, HttpStatus.OK, 'Successfully Get Data', authorData);
    }

    async update(
        request:UpdateAuthorRequest
    ):Promise<ResponseData>{
        let author=await this.checkAuthorMustExists(request.id);

        if (!author) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Author Not Found');
        }

        let slug=author.slug;
        
        if (slug !== request.slug) {
            slug=slugWithId(request.name || "", { uniqueStrategy: "time" });
            request.slug=slug;
        }

        const updateRequest=this.validationService.validate(AuthorValidation.UPDATE,request);


        author=await this.prismaService.author.update({
            where:{
                id:author.id,
            },
            data:{
                ...updateRequest,
                updated_at:new Date()
            }
        })

        const authorData=this.authorResponse(author);

        return responseValueWithData(true, HttpStatus.OK, 'Successfully Updated Data', authorData);
    }

    async remove(authorId:string):Promise<ResponseData>{
        const checkAuthor=await this.checkAuthorMustExists(authorId);

        if (!checkAuthor) {
            return responseValue(false, HttpStatus.NOT_FOUND, 'Author Not Found');
        }

        const author=await this.prismaService.author.update({
            where:{
                id:authorId,
            },
            data:{
                deleted_at:new Date()
            }
        });

        return responseValue(true, HttpStatus.OK, 'Successfully Deleted Data');
    }
}
