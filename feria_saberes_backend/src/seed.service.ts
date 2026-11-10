import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // Asegurate de apuntar bien a tu PrismaService
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 🚀 Este método se ejecuta automáticamente cuando NestJS termina de arrancar
  async onModuleInit() {
    this.logger.log('Chequeando datos iniciales en la base de datos...');
    await this.seedDiviones();
    await this.seedAdmin();
  }

  private async seedDiviones() {
    // Verificamos si ya existen divisiones para no duplicar datos cada vez que reiniciás el server
    const countDiviones = await this.prisma.division.count();

    if (countDiviones === 0) {
      this.logger.log('Insertando divisiones por defecto...');

      await this.prisma.division.createMany({
        data: [
          {
            anio: '1',
            ciclo: 'Basico',
            division: '1ra/A',
            orientacion: null,
          },
          { anio: '1', ciclo: 'Basico', division: '1ra/B', orientacion: null },
          { anio: '1', ciclo: 'Basico', division: '3ra/B', orientacion: null },
          { anio: '1', ciclo: 'Basico', division: '3ra/A', orientacion: null },
          { anio: '2', ciclo: 'Basico', division: '1ra/ ', orientacion: null },
          { anio: '2', ciclo: 'Basico', division: '2da/', orientacion: null },
          { anio: '2', ciclo: 'Basico', division: '3ra/', orientacion: null },
          { anio: '3', ciclo: 'Basico', division: '3ra/A', orientacion: null },
          { anio: '3', ciclo: 'Basico', division: '2da/A', orientacion: null },
          {
            anio: '4',
            ciclo: 'Superior',
            division: '1ra/A',
            orientacion: 'Informatica',
          },
          {
            anio: '4',
            ciclo: 'Superior',
            division: '1ra/B',
            orientacion: 'Informatica',
          },
          {
            anio: '4',
            ciclo: 'Superior',
            division: '2da/',
            orientacion: null,
          },
          {
            anio: '5',
            ciclo: 'Superior',
            division: '1ra/B',
            orientacion: 'Informatica',
          },
          {
            anio: '5',
            ciclo: 'Superior',
            division: '3ra/E',
            orientacion: 'Electricidad',
          },
          {
            anio: '5',
            ciclo: 'Superior',
            division: '1ra/A',
            orientacion: 'Informatica',
          },
          {
            anio: '6',
            ciclo: 'Superior',
            division: '2da/',
            orientacion: null,
          },
          {
            anio: '6',
            ciclo: 'Superior',
            division: '1ra/A',
            orientacion: null,
          },
          {
            anio: '6',
            ciclo: 'Superior',
            division: '1ra/B',
            orientacion: 'Informatica',
          },
        ],
      });

      this.logger.log('¡Divisiones insertadas con éxito!');
    }
  }

  private async seedAdmin() {
    const nombre = process.env.INITIAL_ADMIN_USERNAME?.trim();
    const contrasena = process.env.INITIAL_ADMIN_PASSWORD;

    if (!nombre || !contrasena) {
      this.logger.warn(
        'No se configuraron las credenciales iniciales; se omite la creación del administrador.',
      );
      return;
    }

    const usuarioExistente = await this.prisma.usuarios.findUnique({
      where: { nombre },
    });

    if (usuarioExistente) {
      if (usuarioExistente.rol !== 'admin') {
        this.logger.warn(
          `No se creó el administrador inicial porque "${nombre}" ya pertenece a un usuario sin rol de administrador.`,
        );
      }
      return;
    }

    this.logger.log('Insertando usuario administrador inicial...');

    await this.prisma.usuarios.create({
      data: {
        nombre,
        rol: 'admin',
        contrasena: await bcrypt.hash(contrasena, 10),
      },
    });

    this.logger.log('¡Usuario administrador creado con éxito!');
  }
}
