import { Test, TestingModule } from '@nestjs/testing';
import { DivisionService } from './division.service';
import { PrismaService } from '../prisma.service';

describe('DivisionService', () => {
  let service: DivisionService;
  const prismaMock = {
    division: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DivisionService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DivisionService>(DivisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns divisions ordered for the project form', async () => {
    prismaMock.division.findMany.mockResolvedValue([]);

    await service.findAll();

    expect(prismaMock.division.findMany).toHaveBeenCalledWith({
      orderBy: [{ anio: 'asc' }, { ciclo: 'asc' }, { division: 'asc' }],
    });
  });
});
