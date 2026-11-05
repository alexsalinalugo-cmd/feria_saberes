import { Test, TestingModule } from '@nestjs/testing';
import { ProyectosService } from './proyectos.service';
import { PrismaService } from '../prisma.service';

describe('ProyectosService', () => {
  let service: ProyectosService;
  const prismaMock = {
    proyectos: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    imagenes_proyectos: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    expositores: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      (callback: (transaction: typeof prismaMock) => Promise<unknown>) =>
        callback(prismaMock),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProyectosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProyectosService>(ProyectosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('only returns projects owned by the requested user', async () => {
    prismaMock.proyectos.findMany.mockResolvedValue([]);

    await service.findMine(12);

    expect(prismaMock.proyectos.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { usuario_id: 12 } }),
    );
  });

  it('creates a project with its owner, images, and exhibitors', async () => {
    prismaMock.proyectos.create.mockResolvedValue({ id: 8 });

    await service.create(
      {
        titulo: 'Proyecto de prueba',
        descripcion: 'Descripción',
        division_id: 3,
        imagenes: [
          {
            url_imagen: 'https://example.com/image.webp',
            es_principal: true,
          },
        ],
        expositores: ['Estudiante Uno'],
      },
      12,
    );

    expect(prismaMock.proyectos.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usuario: { connect: { id: 12 } },
          division: { connect: { id: 3 } },
          imagenes_proyectos: {
            create: [
              {
                url_imagen: 'https://example.com/image.webp',
                es_principal: true,
              },
            ],
          },
          expositores: {
            create: [{ nombre_completo: 'Estudiante Uno' }],
          },
        }),
      }),
    );
  });

  it('updates project fields and replaces only the owned project children', async () => {
    prismaMock.proyectos.findFirst.mockResolvedValue({
      id: 8,
      imagenes_proyectos: [
        { id: 4, url_imagen: 'https://example.com/old.webp' },
      ],
    });
    prismaMock.proyectos.findUniqueOrThrow.mockResolvedValue({ id: 8 });
    prismaMock.proyectos.updateMany.mockResolvedValue({ count: 1 });

    await service.updateMine(8, 12, {
      titulo: 'Proyecto actualizado',
      descripcion: 'Nueva descripción',
      division_id: 3,
      imagenes: [
        {
          id: 4,
          url_imagen: 'https://client.example/not-trusted.webp',
          es_principal: true,
        },
        {
          url_imagen: 'https://example.com/new.webp',
          es_principal: false,
        },
      ],
      expositores: ['Estudiante Dos'],
    });

    expect(prismaMock.proyectos.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 8, usuario_id: 12 } }),
    );
    expect(prismaMock.imagenes_proyectos.createMany).toHaveBeenCalledWith({
      data: [
        {
          url_imagen: 'https://example.com/old.webp',
          es_principal: true,
          proyecto_id: 8,
        },
        {
          url_imagen: 'https://example.com/new.webp',
          es_principal: false,
          proyecto_id: 8,
        },
      ],
    });
    expect(prismaMock.expositores.createMany).toHaveBeenCalledWith({
      data: [{ nombre_completo: 'Estudiante Dos', proyecto_id: 8 }],
    });
  });

  it('does not update a project owned by another user', async () => {
    prismaMock.proyectos.findFirst.mockResolvedValue(null);

    await expect(
      service.updateMine(8, 12, {
        titulo: 'Proyecto actualizado',
        division_id: 3,
        imagenes: [],
        expositores: [],
      }),
    ).rejects.toThrow(
      'No se encontró el proyecto o no tenés permiso para editarlo.',
    );

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
