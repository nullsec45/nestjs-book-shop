import { forwardRef, Module } from '@nestjs/common';
import { BookService } from '@/book/book.service';
import { BookAuthorModule } from '@/book-author/book-author.module';

@Module({
  // imports:[forwardRef(() => BookAuthorModule)],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
