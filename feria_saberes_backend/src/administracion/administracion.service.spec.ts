import { Test, TestingModule } from '@nestjs/testing';
import { AdministracionService } from './administracion.service';

describe('AdministracionService', () => {
  let service: AdministracionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministracionService],
    }).compile();

    service = module.get<AdministracionService>(AdministracionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
