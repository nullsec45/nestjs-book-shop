import { forwardRef, Module } from '@nestjs/common';
import { AuthorService } from '@/author/author.service';
import { BookAuthorModule } from '@/book-author/book-author.module';
import { AuthorController } from './author.controller';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { UserService } from '@/user/user.service';

@Module({
  imports:[UserModule],
  controllers:[AuthorController],
  providers: [AuthorService],
  exports: [AuthorService],
})
export class AuthorModule {}
