import { Module, forwardRef } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { MediaModule } from '@/media/media.module';

@Module({
    imports:[
      forwardRef(() => MediaModule)  
    ],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
