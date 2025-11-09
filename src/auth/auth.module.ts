import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { LocalStrategy } from './local.strategy';
import 'dotenv/config';
import { RolesGuard } from './roles.guard';
import { UserModule } from '@/user/user.module';
import { UserService } from '@/user/user.service';
import { forwardRef } from '@nestjs/common';
import { MediaModule } from '@/media/media.module';
import { JwtService } from '@nestjs/jwt';

@Module({
   imports: [
        PassportModule.register({ session: true }), 
        JwtModule.register(
            {
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: "1h"
                }
            }
        ),
        forwardRef(() => UserModule),  
        forwardRef(() => MediaModule),
    ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    RolesGuard, 
    LocalStrategy, 
    JwtStrategy,
    SessionSerializer,
    UserService,
    JwtService, 
   ],
   exports:[RolesGuard, JwtService, AuthService]
})
export class AuthModule {}
