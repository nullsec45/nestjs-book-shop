import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { AuthService } from './auth/auth.service';


@Module({
  imports: [
    AuthModule,
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true, // Agar ConfigService bisa diakses di seluruh aplikasi
    }), 
  ],
  controllers: [AppController],
  providers: [AppService, AuthService,  JwtService],
})
export class AppModule {}
