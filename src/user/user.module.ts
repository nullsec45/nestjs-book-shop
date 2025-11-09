import { Module, forwardRef } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { MediaModule } from '@/media/media.module';
import { UserController } from './user.controller';

@Module({
    imports:[
      forwardRef(() => MediaModule)  
    ],
    controllers:[UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
