import { forwardRef, Module } from '@nestjs/common';
import { AuthorService } from '@/author/author.service';
import { BookAuthorModule } from '@/book-author/book-author.module';

@Module({
//   imports:[forwardRef(() => BookAuthorModule)],
  providers: [AuthorService],
  exports: [AuthorService],
})
export class AuthorModule {}
