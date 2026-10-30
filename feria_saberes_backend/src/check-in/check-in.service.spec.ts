import { Test, TestingModule } from '@nestjs/testing';
import { CheckInService } from './check-in.service';
import { PrismaService } from '../prisma.service';

describe('CheckInService', () => {
  let service: CheckInService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInService,
        {
          provide: PrismaService,
          useValue: {
            checkin: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CheckInService>(CheckInService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
