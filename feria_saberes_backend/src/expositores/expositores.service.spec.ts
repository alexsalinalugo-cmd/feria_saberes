import { Test, TestingModule } from '@nestjs/testing';
import { ExpositoresService } from './expositores.service';

describe('ExpositoresService', () => {
  let service: ExpositoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpositoresService],
    }).compile();

    service = module.get<ExpositoresService>(ExpositoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
