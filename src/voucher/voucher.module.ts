import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';

@Module({
    imports:[UserModule],
    controllers:[VoucherController],
    providers:[VoucherService],
    exports:[VoucherService],
})
export class VoucherModule {}
