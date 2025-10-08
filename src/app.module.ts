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


@Module({
  imports: [
    AuthModule,
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true, // Agar ConfigService bisa diakses di seluruh aplikasi
    }),
    AuthorModule, 
  ],
  controllers: [AppController, AuthorController],
  providers: [AppService, AuthService,  JwtService, AuthorService],
})
export class AppModule {}
