import { Injectable } from '@nestjs/common';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DivisionService {
  constructor(private readonly prisma: PrismaService) {}

  create(_createDivisionDto: CreateDivisionDto) {
    return 'This action adds a new division';
  }

  findAll() {
    return this.prisma.division.findMany({
      orderBy: [{ anio: 'asc' }, { ciclo: 'asc' }, { division: 'asc' }],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} division`;
  }

  update(id: number, _updateDivisionDto: UpdateDivisionDto) {
    return `This action updates a #${id} division`;
  }

  remove(id: number) {
    return `This action removes a #${id} division`;
  }
}
