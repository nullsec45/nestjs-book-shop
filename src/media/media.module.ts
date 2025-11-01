import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import {  memoryStorage } from 'multer';
import {  forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from '@/common/file-upload.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { BookModule } from '@/book/book.module';
import { UserModule } from '@/user/user.module';

@Module({
    imports: [
        forwardRef(() => BookModule),
        forwardRef(() => UserModule),
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
