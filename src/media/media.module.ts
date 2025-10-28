import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage, memoryStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Logger, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from '@/common/file-upload.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { BookModule } from '@/book/book.module';
import { randomFileName } from '@/utils/fileName';

@Module({
    imports: [
        forwardRef(() => BookModule),
         MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: () => ({
                storage:memoryStorage(),
            }),
        }),
        
    ],
    controllers: [MediaController],
    providers: [MediaService,FileUploadService],
    exports: [MediaService],
})
export class MediaModule {}
