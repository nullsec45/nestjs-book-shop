import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import {Logger} from 'winston';
import { CreateMediaRequest, UpdateMediaRequest, MediaResponse } from '@/model/media.model';
import { MediaValidation } from '@/media/media.validation';
import { isUUID } from '@/utils/is-uuid';
import {responseValue, responseValueWithData, responseValueWithPaginate} from '@/utils/response';
import { ResponseData } from '@/types/response';
import { slugWithId } from "@/utils/generate-slug";
import { BookService } from '@/book/book.service';
import { randomBytes } from "crypto";
import { extname } from "path";

@Injectable()
export class MediaService {
    constructor(
        private readonly validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private readonly prismaService:PrismaService,
        private readonly bookService: BookService,
    ){

    }

    async checkMediaParent(parentId:string, type:string):Promise<boolean>{
        switch(type){
            case 'book':
                const book=await this.bookService.checkBookMustExists(parentId);
                return !!book;
            default:
                return false;
        }
    }

    private  randomFileName(originalName: string, len = 16): string {
        const ext = extname(originalName ?? "").toLowerCase(); 
        const id = randomBytes(len).toString("base64url").slice(0, len);
        return `${Date.now()}-${id}${ext}`;
    }

    async create(
        request:CreateMediaRequest,
        file:any
    ):Promise<ResponseData>{
        try{
            const checkParent=await this.checkMediaParent(request.parent_id, request.type);

            if(!checkParent){
                return responseValue(false, HttpStatus.NOT_FOUND, "Parent Not Found");
            }

            const createRequest:CreateMediaRequest=this.validationService.validate(
                MediaValidation.CREATE,
                request
            );

            const fileData=await this.prismaService.media.create({
                data:{
                    parent_id: createRequest.parent_id,
                    name: file.original_name,
                    file_name:this.randomFileName(file.original_name),
                    collection_name: createRequest.collection_name,
                    mime_type: file.mime_type,
                    size: file.size,
                    disk:'local',
                }
            });

            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Uploaded Media', fileData);
        
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async update(
        request:UpdateMediaRequest,
        id:string
    ):Promise<ResponseData>{
        try{
            
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async remove(
        id:string,
    ){
        try{

        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }
}
