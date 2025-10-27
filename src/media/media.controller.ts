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
} from "@nestjs/common";
import { MediaService } from "@/media/media.service";
import { FileUploadService } from "@/common/file-upload.service";
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMediaRequest, UpdateMediaRequest } from "@/model/media.model";
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Response } from 'express'
import { request } from "http";

// @UseGuards(AuthenticatedGuard)
// @UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
    constructor(
      private mediaService:MediaService,
      private readonly fileUploadService:FileUploadService
    ){

    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadMedia(
      @Res() response:Response,
      @Body() request:CreateMediaRequest,
      @UploadedFile() file: Express.Multer.File
    ){
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/svg","image/svg+xml","image/jpg"];
        const fileData=await this.fileUploadService.handleFileUpload(file, allowedMimeTypes, 10 * 1024 * 1024);
        const result=await this.mediaService.create(request, fileData.data);
        return response.status(result.statusCode).json(result);
    }

    @Put('/:mediaId')
    async updateMedia(
      @Res() response:Response,
      @Param('id') id: string,
      @Body() request: UpdateMediaRequest,
      @UploadedFile() file: Express.Multer.File
    ) 
    {
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/svg","image/svg+xml","image/jpg"]; 
      const fileData=await this.fileUploadService.handleFileUpload(file, allowedMimeTypes, 10 * 1024 * 1024);
      const result=await this.mediaService.create(request, fileData.data);
      
      return response.status(result.statusCode).json(result);
    }

    @Delete('/:mediaId')
    async deleteMedia(){

    }
}
