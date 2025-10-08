import { HttpException, Injectable, Inject,HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {Logger} from 'winston';
import { AuthorResponse, CreateAuthorRequest, SearchAuthorRequest, UpdateAuthorRequest } from '@/model/author.model';
import { Author } from "@prisma/client";
import { AuthorValidation } from './author.validation';
import { isUUID } from '@/utils/is-uuid';
import { WebResponse } from "@/model/web.model";
import {responseValue, responseValueWithData, responseValueWithPaginate} from '@/utils/response';
import { ResponseData } from '@/types/response';

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
            slug:author.slug,
            name:author.name,
            bio:author.bio,
        }
    }

    async checkAuthorMustExists(param:string):Promise<Author>{  
        const where = isUUID(param) ? {id:param} : {slug:param};

        const author=await this.prismaService.author.findFirst({
            where: where as any,
        });

        if(!author){
            throw new HttpException('Author is not found',404);
        }

        return author;
    }

    async create(
        request:CreateAuthorRequest
    ):Promise<AuthorResponse>{
        const createRequest:CreateAuthorRequest=this.validationService.validate(
            AuthorValidation.CREATE,
            request
        );

        const author=await this.prismaService.author.create({
            data:{
                ...createRequest,
            }
        });

        return this.authorResponse(author);
    }


    async search(request: SearchAuthorRequest): Promise<ResponseData> {
        const searchRequest: SearchAuthorRequest = this.validationService.validate(AuthorValidation.SEARCH, request);

        const filters: any[] = [];

        // Cari di first_name / last_name
        if (searchRequest.name) {
            filters.push({
            OR: [
                { first_name: { contains: searchRequest.name } },
                { last_name: { contains: searchRequest.name } },
            ],
            });
        }

        // Jika tabel Author juga punya kolom 'name', aktifkan filter ini (biarkan jika diperlukan)
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
            where: { AND: filters },
            take: perPage,
            skip,
            // optional: tambahkan pengurutan kalau mau hasil stabil
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
        const authorData=await this.checkAuthorMustExists(param);

        // return this.authorResponse(authorData);
        return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Get Data', authorData);

    }

    async update(
        request:UpdateAuthorRequest
    ):Promise<AuthorResponse>{
        const updateRequest=this.validationService.validate(AuthorValidation.UPDATE,request);

        let author=await this.checkAuthorMustExists(updateRequest.id);

        author=await this.prismaService.author.update({
            where:{
                id:author.id,
            },
            data:updateRequest
        })

        return this.authorResponse(author);
    }

    async remove(authorId:string):Promise<AuthorResponse>{
        await this.checkAuthorMustExists(authorId);

        const author=await this.prismaService.author.delete({
            where:{
                id:authorId,
            }
        });

        return this.authorResponse(author);
    }
}
