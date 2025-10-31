import { Injectable, Inject, HttpStatus, forwardRef } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@/common/prisma.service';
import { ValidationService } from '@/common/validation.service';
import {Logger} from 'winston';
import { CreateMediaRequest, UpdateMediaRequest, MediaResponse } from '@/model/media.model';
import { MediaValidation } from '@/media/media.validation';
import {responseValue, responseValueWithData, responseValueWithPaginate} from '@/utils/response';
import { ResponseData } from '@/types/response';
import { BookService } from '@/book/book.service';
import { randomFileName } from '@/utils/fileName';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { isRecordNotFound } from '@/utils/check-record';
import { Prisma } from '@prisma/client';
import { tr } from 'zod/locales';

@Injectable()
export class MediaService {
    constructor(
        private readonly validationService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private readonly prismaService:PrismaService,
        @Inject(forwardRef(() => BookService))
        private readonly bookService: BookService,
        private config: ConfigService,
    ){

    }

    private ensureDir(dir: string) {
         if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    private mediaResponse(media:any, old_media?:string):MediaResponse{
        const baseUrl=this.config.get<string>('BASE_URL') || '';
        return {
            url: `${baseUrl}/v1/media/view/${media.id}`,
            alt_name: media.file_name,
            collection_name: media.collection_name,
            old_media:media.old_media
        }
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

    async checkMediaMustExists(id:string){
        const media=await this.prismaService.media.findUnique({
            where:{
                id:id
            }
        });

        return media;
    }
   
    async isUnique(where: Prisma.MediaWhereInput): Promise<boolean> {
            const found = await this.prismaService.media.findFirst({
                where,
                select: { id: true },
            });
            return !Boolean(found);
    }

    async checkMediaParentUnique(type:string, parentId:string, collectionName:string):Promise<boolean>{
        if(type === 'book' || type==='profile'){
            return await this.isUnique({
                AND: [{ parent_id: parentId }, { collection_name: collectionName }],
            });
        }

        return true;
    }

    async create(
        request:CreateMediaRequest,
        file:any
    ):Promise<ResponseData>{
        try{
            const createRequest:CreateMediaRequest=this.validationService.validate(
                MediaValidation.CREATE,
                request
            );
            
            const checkParent=await this.checkMediaParent(createRequest.parent_id, createRequest.type);

            if(!checkParent){
                return responseValue(false, HttpStatus.NOT_FOUND, "Parent Not Found");
            }

            const ok = await this.checkMediaParentUnique('book', request.parent_id, request.collection_name);
            if (!ok) {
                return responseValue(false, HttpStatus.CONFLICT, "Media already exists for this parent and collection name."); 
            }

            const fileName=randomFileName(file.original_name);
            const baseDir = this.config.get<string>('PATH_FILE')+'/'+createRequest.collection_name || 'uploads'+'/'+createRequest.collection_name;
            const destDir = path.isAbsolute(baseDir) ? baseDir : path.resolve(process.cwd(), baseDir);

            this.ensureDir(destDir);
          
            const filePath = path.join(destDir, fileName);
            await fs.promises.writeFile(filePath, file.buffer);

            const createdFile=await this.prismaService.media.create({
                data:{
                    parent_id: createRequest.parent_id,
                    name: file.original_name,
                    file_name:fileName,
                    collection_name: createRequest.collection_name,
                    mime_type: file.mime_type,
                    size: file.size,
                    disk:'local',
                }
            });

            const fileData=this.mediaResponse(createdFile);

            return responseValueWithData(true, HttpStatus.CREATED, 'Successfully Uploaded Media', fileData);
        
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async findOneByParent(
        parentId:string,
        collectionName?:string,
    ):Promise<ResponseData | MediaResponse>{
        try{
            const whereClause:any={
                parent_id: parentId
            };

            if(collectionName){
                whereClause.collection_name=collectionName;
            }

            const media=await this.prismaService.media.findFirst({
                where: whereClause
            });

            if(!media){
                return responseValue(false, HttpStatus.NOT_FOUND, "Media Not Found");
            }

            const responseData=this.mediaResponse(media);

            return responseData;
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async view(
        mediaId:string,
    ):Promise<ResponseData>{
        try{
        
            const media=await this.prismaService.media.findUnique({
                where: {
                    id: mediaId
                }
            });

            if(!media){
                return responseValue(false, HttpStatus.NOT_FOUND, "Media Not Found");
            }

            const baseDir = this.config.get<string>('PATH_FILE')+'/'+media.collection_name || 'uploads'+'/'+media.collection_name;
            const destDir = path.isAbsolute(baseDir) ? baseDir : path.resolve(process.cwd(), baseDir);

            this.ensureDir(destDir);
            const filePath = path.join(destDir, media.file_name);

            if (!fs.existsSync(filePath)) { 
                return responseValue(false, HttpStatus.NOT_FOUND, 'File Not Found');
            }

            return responseValueWithData(true, HttpStatus.OK, 'Successfully Uploaded Media', filePath);
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async findAllByParent(
        parentId:string,
        collectionName?:string,
        module:string='controller'
    ):Promise<ResponseData | MediaResponse[]>{
        try{
            const whereClause:any={
                parent_id: parentId
            };

            if(collectionName){
                whereClause.collection_name=collectionName;
            }

            const mediaList=await this.prismaService.media.findMany({
                where: whereClause
            });

            const responseData=mediaList.map(media=>this.mediaResponse(media));

            if(module==='controller'){
                return responseValueWithData(true, HttpStatus.OK, 'Successfully Retrieved Media List', responseData);
            }

            return responseData;
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async update(
        request:UpdateMediaRequest,
        file:any
    ):Promise<ResponseData>{
        try{
            const mediaExists=await this.checkMediaMustExists(request.id);
            
            if(isRecordNotFound(mediaExists)){
                return responseValue(false, HttpStatus.NOT_FOUND, "Media Not Found");
            }
            
            const oldMedia=mediaExists.file_name;
           
            const checkParent=await this.checkMediaParent(request.parent_id, request.type);

            if(!checkParent){
                return responseValue(false, HttpStatus.NOT_FOUND, "Parent Not Found");
            }

            const createRequest:CreateMediaRequest=this.validationService.validate(
                MediaValidation.CREATE,
                request
            );

            const fileName=randomFileName(file.original_name);
            const baseDir = this.config.get<string>('PATH_FILE')+'/'+request.collection_name || 'uploads'+'/'+request.collection_name;
            const destDir = path.isAbsolute(baseDir) ? baseDir : path.resolve(process.cwd(), baseDir);

            this.ensureDir(destDir);
          
            const filePath = path.join(destDir, fileName);
            await fs.promises.writeFile(filePath, file.buffer);

            const updatedFile=await this.prismaService.media.update({
                where:{
                    id:request.id
                },
                data:{
                    parent_id: createRequest.parent_id,
                    name: file.original_name,
                    file_name:fileName,
                    collection_name: createRequest.collection_name,
                    mime_type: file.mime_type,
                    size: file.size,
                    disk:'local',
                }
            });

            const fileData=this.mediaResponse(updatedFile);
            fileData.old_media=oldMedia;

            return responseValueWithData(true, HttpStatus.OK, 'Successfully Uploaded Media', fileData);
        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }

    async remove(
        id:string,
    ):Promise<ResponseData>{
        try{
            const mediaExists=await this.checkMediaMustExists(id);
            
            if(isRecordNotFound(mediaExists)){
                return responseValue(false, HttpStatus.NOT_FOUND, "Media Not Found");
            }

            await this.prismaService.media.delete({
                where:{
                    id
                }
            });

            const file={
                collection_name: mediaExists.collection_name,
                file_name: mediaExists.file_name
            }

            return responseValueWithData(true, HttpStatus.OK, 'Successfully Deleted Media', file);

        }catch(error){
            return responseValue(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message ?? 'Internal server error.');
        }
    }
}
