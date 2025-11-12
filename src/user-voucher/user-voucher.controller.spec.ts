import { Test, TestingModule } from '@nestjs/testing';
import { UserVoucherController } from './user-voucher.controller';

describe('UserVoucherController', () => {
  let controller: UserVoucherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserVoucherController],
    }).compile();

    controller = module.get<UserVoucherController>(UserVoucherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
