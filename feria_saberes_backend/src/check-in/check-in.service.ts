import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCheckInDto: CreateCheckInDto) {
    return await this.prisma.checkin.create({
      data: {
        categoria: createCheckInDto.categoria,
        integrantes: createCheckInDto.integrantes,
        nombre: createCheckInDto.nombre?.trim() || null,
      },
    });
  }

  async findAll() {
    return await this.prisma.checkin.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async getStats() {
    const [totalRegistros, aggregate, porCategoria] = await Promise.all([
      this.prisma.checkin.count(),
      this.prisma.checkin.aggregate({
        _sum: { integrantes: true },
      }),
      this.prisma.checkin.groupBy({
        by: ['categoria'],
        _sum: { integrantes: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalRegistros,
      totalPersonas: aggregate._sum.integrantes ?? 0,
      porCategoria: porCategoria.map((cat) => ({
        categoria: cat.categoria,
        totalPersonas: cat._sum.integrantes ?? 0,
        totalGrupos: cat._count.id,
      })),
    };
  }

  async findOne(id: number) {
    const checkin = await this.prisma.checkin.findUnique({
      where: { id },
    });
    if (!checkin) {
      throw new NotFoundException(`Check-in con ID #${id} no encontrado`);
    }
    return checkin;
  }

  async update(id: number, updateCheckInDto: UpdateCheckInDto) {
    await this.findOne(id);
    return await this.prisma.checkin.update({
      where: { id },
      data: {
        ...(updateCheckInDto.categoria && {
          categoria: updateCheckInDto.categoria,
        }),
        ...(updateCheckInDto.integrantes !== undefined && {
          integrantes: updateCheckInDto.integrantes,
        }),
        ...(updateCheckInDto.nombre !== undefined && {
          nombre: updateCheckInDto.nombre?.trim() || null,
        }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prisma.checkin.delete({
      where: { id },
    });
  }
}
