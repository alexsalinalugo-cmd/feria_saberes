import { Test, TestingModule } from '@nestjs/testing';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

describe('ReportesController', () => {
  let controller: ReportesController;

  const mockReportesService = {
    getDashboardReportes: jest.fn().mockResolvedValue({
      checkin: { totalAsistentes: 50, totalGrupos: 15 },
      proyectos: { totalProyectos: 12 },
      comunidad: { totalExpositores: 30 },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [
        {
          provide: ReportesService,
          useValue: mockReportesService,
        },
      ],
    }).compile();

    controller = module.get<ReportesController>(ReportesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get dashboard data', async () => {
    const data = await controller.getDashboard();
    expect(data.checkin.totalAsistentes).toBe(50);
    expect(mockReportesService.getDashboardReportes).toHaveBeenCalled();
  });
});
