import { BookModule } from '@/book/book.module';
import { forwardRef, Module } from '@nestjs/common';
import { BookAuthorService } from './book-author.service';
import { AuthorModule } from '@/author/author.module';

@Module({
    imports: [forwardRef(() => BookModule), forwardRef(() => AuthorModule)],
    providers:[BookAuthorService],
    exports: [BookAuthorService],
})
export class BookAuthorModule {}
