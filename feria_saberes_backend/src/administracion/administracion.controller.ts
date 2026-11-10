import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdministracionService } from './administracion.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { LargeNumberLike } from 'crypto';
@Controller('administracion')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdministracionController {
  constructor(private readonly administracionService: AdministracionService) {}

  @Get('usuarios')
  findUsuarios() {
    return this.administracionService.findUsuarios();
  }

  @Post('usuarios')
  CreateUsuario(
    @Body()
    datos: {
      nombre: string;
      contrasena: string;
      rol?: 'admin' | 'usuario';
    },
  ) {
    return this.administracionService.createUsuario(datos);
  }

  @Patch('usuarios/:id')
  updatedUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    datos: {
      nombre?: string;
      rol?: 'admin' | 'usuario';
      contrasena?: string;
    },
  ) {
    return this.administracionService.updateUsuario(id, datos);
  }

  @Get('divisiones')
  findDivisiones() {
    return this.administracionService.findDivisiones();
  }

  @Post('divisiones')
  createDivision(
    @Body()
    datos: {
      anio: string;
      ciclo: 'Basico' | 'Superior';
      division?: string;
      orientacion: 'Electricidad' | 'Informatica' | null;
    },
  ) {
    return this.administracionService.createDivision(datos);
  }

  @Patch('divisiones/:id')
  updateDivision(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    datos: {
      anio?: string;
      ciclo?: 'Basico' | 'Superior';
      division?: string;
      orientacion?: 'Electricidad' | 'Informatica' | null;
    },
  ) {
    return this.administracionService.updateDivision(id, datos);
  }

  @Get('proyectos')
  findProyectos() {
    return this.administracionService.findProyectos();
  }

  @Get('proyectos/todos')
  findTodosProyectos() {
    return this.administracionService.findTodosProyectos();
  }

  @Get('proyectos/:id')
  findProyecto(@Param('id', ParseIntPipe) id: number) {
    return this.administracionService.findProyecto(id);
  }

  @Patch('proyectos/:id')
  updateProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    datos: {
      titulo?: string;
      descripcion?: string | null;
      valoracion?: number | null;
      division_id?: number;
      usuario_id: number | null;
    },
  ) {
    return this.administracionService.updateProyecto(id, datos);
  }

  @Patch('proyectos/:id/baja')
  darDeBajaProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    datos: {
      motivo: string;
    },
  ) {
    return this.administracionService.darDeBajaProyecto(id, datos.motivo);
  }

  @Patch('proyectos/:id/reactivar')
  reactivarProyecto(@Param('id', ParseIntPipe) id: number) {
    return this.administracionService.reactivarProyecto(id);
  }
}
