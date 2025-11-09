import { BookModule } from '@/book/book.module';
import { forwardRef, Module } from '@nestjs/common';
import { BookAuthorService } from './book-author.service';
import { AuthorModule } from '@/author/author.module';
import { BookAuthorController } from './book-author.controller';
import { UserModule } from '@/user/user.module';

@Module({
    imports: [
        UserModule,
        forwardRef(() => BookModule), 
        forwardRef(() => AuthorModule)
    ],
    controllers:[BookAuthorController],
    providers:[BookAuthorService],
    exports: [BookAuthorService],
})
export class BookAuthorModule {}
