import { forwardRef, Module } from '@nestjs/common';
import { BookService } from '@/book/book.service';
import { MediaModule } from '@/media/media.module';
import { BookController } from './book.controller';
import { UserModule } from '@/user/user.module';

@Module({
  imports:[
    forwardRef(() => UserModule),
    forwardRef(() => MediaModule),
  ],
  controllers:[BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
