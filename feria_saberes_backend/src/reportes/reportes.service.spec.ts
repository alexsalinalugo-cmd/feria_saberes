import { Test, TestingModule } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { PrismaService } from '../prisma.service';

describe('ReportesService', () => {
  let service: ReportesService;

  const mockPrismaService = {
    checkin: {
      count: jest.fn().mockResolvedValue(10),
      aggregate: jest.fn().mockResolvedValue({ _sum: { integrantes: 25 } }),
      groupBy: jest.fn().mockResolvedValue([
        { categoria: 'familiar', _sum: { integrantes: 15 }, _count: { id: 6 } },
        { categoria: 'alumno', _sum: { integrantes: 10 }, _count: { id: 4 } },
      ]),
      findMany: jest.fn().mockResolvedValue([]),
    },
    proyectos: {
      count: jest.fn().mockResolvedValue(8),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    expositores: {
      count: jest.fn().mockResolvedValue(20),
    },
    resenas_proyectos: {
      count: jest.fn().mockResolvedValue(12),
    },
    usuarios: {
      count: jest.fn().mockResolvedValue(5),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return dashboard stats properly', async () => {
    const result = await service.getDashboardReportes();
    expect(result).toBeDefined();
    expect(result.checkin.totalAsistentes).toBe(25);
    expect(result.checkin.totalGrupos).toBe(10);
    expect(result.proyectos.totalProyectos).toBe(8);
    expect(result.comunidad.totalExpositores).toBe(20);
  });
});
