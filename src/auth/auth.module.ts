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

@Module({
   imports: [PassportModule.register({ session: true }), JwtModule.register(
        {
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: "1h"
            }
        }
    )],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy,SessionSerializer]
})
export class AuthModule {}
