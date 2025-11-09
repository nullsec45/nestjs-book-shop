import { UserController } from '@/user/user.controller';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { BookModule } from '@/book/book.module';

@Module({
    imports:[UserModule, BookModule],
    controllers:[OrderController],
    providers:[OrderService],
    exports:[OrderService]
})
export class OrderModule {}
