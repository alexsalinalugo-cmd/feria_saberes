import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdministracionService {
  constructor(private readonly prisma: PrismaService) {}

  async findUsuarios() {
    return this.prisma.usuarios.findMany({
      select: {
        id: true,
        nombre: true,
        rol: true,
      },
    });
  }

  async createUsuario(datos: {
    nombre: string;
    contrasena: string;
    rol?: 'admin' | 'usuario';
  }) {
    const usuarioExistente = await this.prisma.usuarios.findUnique({
      where: {
        nombre: datos.nombre,
      },
    });

    if (usuarioExistente) {
      throw new BadRequestException('Ese nombre de usuario a existe');
    }

    const contrasenaEncriptada = await bcrypt.hash(datos.contrasena, 10);

    return this.prisma.usuarios.create({
      data: {
        nombre: datos.nombre,
        contrasena: contrasenaEncriptada,
        rol: datos.rol ?? 'usuario',
      },
      select: {
        id: true,
        nombre: true,
        rol: true,
      },
    });
  }

  async updateUsuario(
    id: number,
    datos: {
      nombre?: string;
      rol?: 'admin' | 'usuario';
      contrasena?: string;
    },
  ) {
    const usuarioExistente = await this.prisma.usuarios.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (datos.nombre) {
      const nombreExistente = await this.prisma.usuarios.findUnique({
        where: { nombre: datos.nombre },
      });

      if (nombreExistente && nombreExistente.id !== id) {
        throw new BadRequestException('Ese nombre de usuario a existe');
      }
    }
    const contrasenaEncriptada = datos.contrasena
      ? await bcrypt.hash(datos.contrasena, 10)
      : undefined;
    return this.prisma.usuarios.update({
      where: { id },
      data: {
        nombre: datos.nombre,
        rol: datos.rol,
        contrasena: contrasenaEncriptada,
      },
      select: {
        id: true,
        nombre: true,
        rol: true,
      },
    });
  }

  async findDivisiones() {
    return this.prisma.division.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async createDivision(datos: {
    anio: string;
    ciclo: 'Basico' | 'Superior';
    division?: string;
    orientacion: 'Electricidad' | 'Informatica' | null;
  }) {
    return this.prisma.division.create({
      data: {
        anio: datos.anio,
        ciclo: datos.ciclo,
        division: datos.division,
        orientacion: datos.orientacion,
      },
    });
  }

  async updateDivision(
    id: number,
    datos: {
      anio?: string;
      ciclo?: 'Basico' | 'Superior';
      division?: string;
      orientacion?: 'Electricidad' | 'Informatica' | null;
    },
  ) {
    const divisionExistente = await this.prisma.division.findUnique({
      where: { id },
    });

    if (!divisionExistente) {
      throw new NotFoundException('Division no encontrada');
    }

    return this.prisma.division.update({
      where: { id },
      data: datos,
    });
  }

  async findTodosProyectos() {
    return this.prisma.proyectos.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findProyectos() {
    return this.prisma.proyectos.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findProyecto(id: number) {
    const proyecto = await this.prisma.proyectos.findUnique({
      where: { id },
    });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return proyecto;
  }

  async updateProyecto(
    id: number,
    datos: {
      titulo?: string;
      descripcion?: string | null;
      valoracion?: number | null;
      division_id?: number;
      usuario_id?: number | null;
    },
  ) {
    const proyectoExistente = await this.prisma.proyectos.findUnique({
      where: { id },
    });

    if (!proyectoExistente) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return this.prisma.proyectos.update({
      where: { id },
      data: datos,
    });
  }

  async darDeBajaProyecto(id: number, motivo: string) {
    if (!motivo.trim()) {
      throw new BadRequestException('Debes indicar el motivo de la baja');
    }
    const proyecto = await this.prisma.proyectos.findUnique({
      where: { id },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (!proyecto.activo) {
      throw new BadRequestException('El proyecto ya esta dado de baja');
    }

    return this.prisma.proyectos.update({
      where: { id },
      data: {
        activo: false,
        motivo_baja: motivo,
        hora_baja: new Date(),
      },
    });
  }

  async reactivarProyecto(id: number) {
    const proyecto = await this.prisma.proyectos.findUnique({
      where: { id },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (proyecto.activo) {
      throw new BadRequestException('El proyecto ya esta activo');
    }

    return this.prisma.proyectos.update({
      where: { id },
      data: {
        activo: true,
        motivo_baja: null,
        hora_baja: null,
      },
    });
  }
}
