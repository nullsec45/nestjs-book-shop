import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Logger, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from '@/common/file-upload.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { BookModule } from '@/book/book.module';

@Module({
    imports: [
        forwardRef(() => BookModule),
         MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const logger = new Logger('MulterFactory');
                const dirFromEnv = configService.get<string>('PATH_FILE'); // mis. "uploads"
                // pastikan absolute path biar aman
                const destDir = path.isAbsolute(dirFromEnv)
                ? dirFromEnv
                : path.resolve(process.cwd(), dirFromEnv);

                if (dirFromEnv) {                                                           
                    if (!fs.existsSync(destDir)) {
                        fs.mkdirSync(destDir, { recursive: true });
                    }
                }

                return {
                    storage: diskStorage({
                        destination: destDir, // tetap pakai PATH_FILE dari env
                        filename: (req, file, cb) => {
                        const filename = `${Date.now()}_${file.originalname}`;
                        cb(null, filename);
                        },
                    }),
                };
            },
        }),
        
    ],
    controllers: [MediaController],
    providers: [MediaService,FileUploadService],
    // exports: [FileUploadService],
})
export class MediaModule {}
