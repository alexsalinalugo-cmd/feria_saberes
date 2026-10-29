import { Test, TestingModule } from '@nestjs/testing';
import { ExpositoresController } from './expositores.controller';
import { ExpositoresService } from './expositores.service';

describe('ExpositoresController', () => {
  let controller: ExpositoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpositoresController],
      providers: [ExpositoresService],
    }).compile();

    controller = module.get<ExpositoresController>(ExpositoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
