import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { AuthService } from './auth/auth.service';
import { AuthorController } from './author/author.controller';
import { AuthorService } from './author/author.service';
import { AuthorModule } from './author/author.module';
import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';
import { CategoryModule } from './category/category.module';
import { BookController } from './book/book.controller';
import { BookService } from './book/book.service';
import { BookModule } from './book/book.module';
import { BookAuthorController } from './book-author/book-author.controller';
import { BookAuthorService } from './book-author/book-author.service';
import { BookAuthorModule } from './book-author/book-author.module';


@Module({
  imports: [
    AuthModule,
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true, // Agar ConfigService bisa diakses di seluruh aplikasi
    }),
    AuthorModule,
    CategoryModule,
    BookModule,
    BookAuthorModule, 
  ],
  controllers: [AppController, AuthorController, CategoryController, BookController, BookAuthorController],
  providers: [AppService, AuthService,  JwtService, AuthorService, CategoryService, BookService, BookAuthorService],
})
export class AppModule {}
