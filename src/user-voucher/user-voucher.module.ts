import { Module } from '@nestjs/common';
import { UserVoucherController } from './user-voucher.controller';
import { UserVoucherService } from './user-voucher.service';
import { VoucherModule } from '@/voucher/voucher.module';
import { UserModule } from '@/user/user.module';

@Module({
    imports:[UserModule, VoucherModule],
    controllers:[UserVoucherController],
    providers:[UserVoucherService],
    exports:[UserVoucherService],
})
export class UserVoucherModule {}
