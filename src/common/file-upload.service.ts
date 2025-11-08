import { BadRequestException, Injectable, HttpStatus } from '@nestjs/common';
import { ResponseData } from '@/types/response';
import {responseValue, responseValueWithData, } from '@/utils/response';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { FileData } from '@/model/media.model';

@Injectable()
export class FileUploadService {
    constructor(private configService:ConfigService){

    }

    private fileDataResponse<T>(media:any):FileData{
        return {
            field_name:media.fieldname,
            original_name: media.originalname,
            encoding: media.encoding,
            size: media.size,
            mime_type: media.mimetype
        }
    }
    
    async handleFileUpload(
        file:Express.Multer.File,
        allowedMimeTypes?:string[],
        maxSize?:number
    ):Promise<ResponseData>{
        try{
            if(!file){
                return responseValue(false, HttpStatus.NOT_FOUND,"File Not Found")
            }

            // const allowedMimeTypes=["image/jpeg","image/png"];
            if(!allowedMimeTypes.includes(file.mimetype)){
                return responseValue(false,HttpStatus.CONFLICT, "Invalid File Type");
            }

            // const maxSize= 5 * 1024 * 1024;
            if(file.size > maxSize){
                return responseValue(false,HttpStatus.CONFLICT, "File is too large!");
            }

            const mediaResponse=this.fileDataResponse<FileData>(file);

            return responseValueWithData(true, HttpStatus.OK, "File uploaded successfully", mediaResponse);
        }catch(error){
            return responseValue(false, HttpStatus.CONFLICT, error.message);
        }
    }

    async handleFileDelete(fileName:string){
        try{
 
            if (fs.existsSync(fileName)) {
                fs.unlinkSync(fileName);
            } else {
                return responseValue(false, HttpStatus.NOT_FOUND, "File Not Found");
            }
        }catch(error){
            return responseValue(false, HttpStatus.CONFLICT, error.message);
        }
    }
}
