import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ProyectosService } from './proyectos.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { UpdateProyectoPropietarioDto } from './dto/update-proyecto-propietario.dto';
import { Public } from '../auth/jwt-auth.guard';

@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}
  @Post()
  create(
    @Body() createProyectoDto: CreateProyectoDto,
    @Req() request: FastifyRequest & { user: { sub: number } },
  ) {
    return this.proyectosService.create(createProyectoDto, request.user.sub);
  }

  @Post('imagenes')
  async uploadImage(@Req() request: FastifyRequest) {
    const file = await request.file();
    if (!file) {
      throw new BadRequestException('Seleccioná una imagen para subir.');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'El archivo seleccionado no es una imagen.',
      );
    }
    return this.proyectosService.uploadFile(file);
  }

  @Get('mis-proyectos')
  findMine(@Req() request: FastifyRequest & { user: { sub: number } }) {
    return this.proyectosService.findMine(request.user.sub);
  }

  @Patch(':id')
  updateMine(
    @Param('id') id: string,
    @Body() updateProyectoDto: UpdateProyectoPropietarioDto,
    @Req() request: FastifyRequest & { user: { sub: number } },
  ) {
    return this.proyectosService.updateMine(
      Number(id),
      request.user.sub,
      updateProyectoDto,
    );
  }

  @Public()
  @Post('resenas')
  createResena(@Body() resenaDto: any) {
    return this.proyectosService.createResena(resenaDto);
  }
  @Public()
  @Get()
  findAll() {
    return this.proyectosService.findAll();
  }
  @Public()
  @Get('resenas/:proyectoId')
  findAllResenas(@Param('proyectoId') proyectoId: string) {
    return this.proyectosService.findAllResenas(+proyectoId);
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proyectosService.findOne(+id);
  }
  @Public()
  @Put('')
  update(@Body() updateProyectoDto: UpdateProyectoDto) {
    return this.proyectosService.update(updateProyectoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proyectosService.remove(+id);
  }
}
