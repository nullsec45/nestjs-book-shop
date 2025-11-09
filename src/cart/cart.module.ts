import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { BookModule } from '@/book/book.module';

@Module({
    imports:[UserModule,BookModule],
    controllers:[CartController],
    providers:[CartService],
    exports:[CartService],
})
export class CartModule {}
