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


@Module({
  imports: [
    AuthModule,
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true, // Agar ConfigService bisa diakses di seluruh aplikasi
    }),
    AuthorModule,
    CategoryModule, 
  ],
  controllers: [AppController, AuthorController, CategoryController],
  providers: [AppService, AuthService,  JwtService, AuthorService, CategoryService],
})
export class AppModule {}
