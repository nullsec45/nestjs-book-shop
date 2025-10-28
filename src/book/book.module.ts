import { forwardRef, Module } from '@nestjs/common';
import { BookService } from '@/book/book.service';
import { BookAuthorModule } from '@/book-author/book-author.module';
import { MediaModule } from '@/media/media.module';

@Module({
  imports:[
    forwardRef(() => MediaModule),
  ],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
