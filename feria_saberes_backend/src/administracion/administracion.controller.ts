import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdministracionService } from './administracion.service';
import { CreateAdministracionDto } from './dto/create-administracion.dto';
import { UpdateAdministracionDto } from './dto/update-administracion.dto';

@Controller('administracion')
export class AdministracionController {
  constructor(private readonly administracionService: AdministracionService) {}

  @Post()
  create(@Body() createAdministracionDto: CreateAdministracionDto) {
    return this.administracionService.create(createAdministracionDto);
  }

  @Get()
  findAll() {
    return this.administracionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.administracionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdministracionDto: UpdateAdministracionDto) {
    return this.administracionService.update(+id, updateAdministracionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.administracionService.remove(+id);
  }
}
