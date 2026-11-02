import { Test, TestingModule } from '@nestjs/testing';
import { AdministracionController } from './administracion.controller';
import { AdministracionService } from './administracion.service';

describe('AdministracionController', () => {
  let controller: AdministracionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministracionController],
      providers: [AdministracionService],
    }).compile();

    controller = module.get<AdministracionController>(AdministracionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
