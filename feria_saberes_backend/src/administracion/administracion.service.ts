import { Injectable } from '@nestjs/common';
import { CreateAdministracionDto } from './dto/create-administracion.dto';
import { UpdateAdministracionDto } from './dto/update-administracion.dto';

@Injectable()
export class AdministracionService {
  create(createAdministracionDto: CreateAdministracionDto) {
    return 'This action adds a new administracion';
  }

  findAll() {
    return `This action returns all administracion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} administracion`;
  }

  update(id: number, updateAdministracionDto: UpdateAdministracionDto) {
    return `This action updates a #${id} administracion`;
  }

  remove(id: number) {
    return `This action removes a #${id} administracion`;
  }
}
