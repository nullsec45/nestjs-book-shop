import { Test, TestingModule } from '@nestjs/testing';
import { UserVoucherService } from './user-voucher.service';

describe('UserVoucherService', () => {
  let service: UserVoucherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserVoucherService],
    }).compile();

    service = module.get<UserVoucherService>(UserVoucherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
