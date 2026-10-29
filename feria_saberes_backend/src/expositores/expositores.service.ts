import { Injectable } from '@nestjs/common';
import { CreateExpositoreDto } from './dto/create-expositore.dto';
import { UpdateExpositoreDto } from './dto/update-expositore.dto';

@Injectable()
export class ExpositoresService {
  create(createExpositoreDto: CreateExpositoreDto) {
    return 'This action adds a new expositore';
  }

  findAll() {
    return `This action returns all expositores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expositore`;
  }

  update(id: number, updateExpositoreDto: UpdateExpositoreDto) {
    return `This action updates a #${id} expositore`;
  }

  remove(id: number) {
    return `This action removes a #${id} expositore`;
  }
}
