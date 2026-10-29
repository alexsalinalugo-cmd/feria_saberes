import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpositoresService } from './expositores.service';
import { CreateExpositoreDto } from './dto/create-expositore.dto';
import { UpdateExpositoreDto } from './dto/update-expositore.dto';

@Controller('expositores')
export class ExpositoresController {
  constructor(private readonly expositoresService: ExpositoresService) {}

  @Post()
  create(@Body() createExpositoreDto: CreateExpositoreDto) {
    return this.expositoresService.create(createExpositoreDto);
  }

  @Get()
  findAll() {
    return this.expositoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expositoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpositoreDto: UpdateExpositoreDto) {
    return this.expositoresService.update(+id, updateExpositoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expositoresService.remove(+id);
  }
}
