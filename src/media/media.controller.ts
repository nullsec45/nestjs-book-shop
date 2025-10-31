import { 
    Controller,
    Post,
    HttpCode,
    Body, 
    Get,
    Param, 
    Put, 
    Delete, 
    UseGuards, 
    Res,
    UseInterceptors, 
    UploadedFile,
    Patch
} from "@nestjs/common";
import { MediaService } from "@/media/media.service";
import { FileUploadService } from "@/common/file-upload.service";
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMediaRequest, UpdateMediaRequest } from "@/model/media.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { request } from "http";
import { fi } from "zod/locales";
import { ConfigService } from '@nestjs/config';
import path from "path";


@UseGuards(AuthenticatedGuard)
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
    constructor(
      private mediaService:MediaService,
      private readonly fileUploadService:FileUploadService,
      private readonly config: ConfigService,
    ){

    }

    private allowedMimeTypes(type: string){
      switch(type){
        case 'image':
          return ["image/jpeg", "image/png", "image/svg","image/svg+xml","image/jpg"];
        case 'video':
          return ["video/mp4", "video/mpeg", "video/quicktime"];
        case 'audio':
          return ["audio/mpeg", "audio/wav", "audio/ogg"];
        case 'document':
          return ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        case 'excel':
          return ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
        case 'ppt':
          return ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
        case 'zip':
          return ["application/zip", "application/x-rar-compressed"];
        case 'word':
          return ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        default:
          return [];
      }
    }

    private allowedMimeTypeByParent(parent: string){
      let mimeType:string[] | null=null;
      
      switch(parent){
        case 'book':
          mimeType=this.allowedMimeTypes('image');
          break;
        case 'profile':
          mimeType=this.allowedMimeTypes('image');
          break;
        default:
          mimeType=null;
      } 

      return mimeType;
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadMedia(
      @Res() response:Response,
      @Body() request:CreateMediaRequest,
      @UploadedFile() file: Express.Multer.File
    ){
        const allowedMimeTypes = this.allowedMimeTypeByParent(request.type) || [];
        const fileData=await this.fileUploadService.handleFileUpload(file, allowedMimeTypes, 10 * 1024 * 1024);
        console.log(fileData);
        fileData.data.buffer=file.buffer;
        const result=await this.mediaService.create(request, fileData.data);
        return response.status(result.statusCode).json(result);
    }

    @Get('view/:mediaId')
    async view(
      @Res() res: Response,
      @Param('mediaId') mediaId: string, 
    ) {
      const result=await this.mediaService.view(mediaId);
      
      if(result.statusCode !== 200){
        return res.status(result.statusCode).json(result);
      }

      return res.sendFile(result.data);
   }

    @Patch(':mediaId')
    @UseInterceptors(FileInterceptor('file'))
    async updateMedia(
      @Res() response:Response,
      @Param('mediaId') mediaId: string,
      @Body() request: UpdateMediaRequest,
      @UploadedFile() file: Express.Multer.File
    ) 
    {
      const allowedMimeTypes = this.allowedMimeTypeByParent(request.type) || []; 
      const fileData=await this.fileUploadService.handleFileUpload(file, allowedMimeTypes, 10 * 1024 * 1024);
      fileData.data.buffer=file.buffer;
      request.id=mediaId;
      const result=await this.mediaService.update(request, fileData.data);

      if(result.statusCode !== 200){
        return response.status(result.statusCode).json(result);
      }

      const {old_media, ...rest}=result.data;
      result.data=rest;

      const baseDirEnv = this.config.get<string>('PATH_FILE') || 'uploads';

      const filePath=`${baseDirEnv}/${result.data.collection_name}/${old_media}`;
      await this.fileUploadService.handleFileDelete(filePath);
      
      return response.status(result.statusCode).json(result);
    }

    @Delete('/:mediaId')
    async deleteMedia(
      @Res() response:Response,
      @Param('mediaId') mediaId: string,
    ){
      const result=await this.mediaService.remove(mediaId);

      if(result.statusCode !== 200){
        return response.status(result.statusCode).json(result);
      }

      const baseDirEnv = this.config.get<string>('PATH_FILE') || 'uploads';

      const filePath=`${baseDirEnv}/${result.data.collection_name}/${result.data.alt_name}`;
      await this.fileUploadService.handleFileDelete(filePath);

      const {data, ...res}=result;

      return response.status(result.statusCode).json(res);
    }
}
