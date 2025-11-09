import { forwardRef, Module } from '@nestjs/common';
import { BookCategoryController } from './book-category.controller';
import { BookCategoryService } from './book-category.service';
import { UserModule } from '@/user/user.module';
import { BookModule } from '@/book/book.module';
import { CategoryModule } from '@/category/category.module';

@Module({
    imports:[UserModule, BookModule,CategoryModule],
    controllers:[BookCategoryController],
    providers:[BookCategoryService],
    exports:[BookCategoryService],
})
export class BookCategoryModule {}
