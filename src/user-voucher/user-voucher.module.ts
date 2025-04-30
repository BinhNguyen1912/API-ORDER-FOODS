import { Module } from '@nestjs/common';
import { UserVoucherService } from './user-voucher.service';
import { UserVoucherController } from './user-voucher.controller';

@Module({
  controllers: [UserVoucherController],
  providers: [UserVoucherService],
})
export class UserVoucherModule {}
