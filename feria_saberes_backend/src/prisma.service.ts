import 'dotenv/config';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const rawUrl =
      process.env.DATABASE_URL || 'mysql://root:@localhost:3306/feria_saberes';

    let adapter: PrismaMariaDb;
    try {
      const url = new URL(rawUrl);
      adapter = new PrismaMariaDb({
        host: url.hostname || 'localhost',
        port: Number(url.port) || 3306,
        user: decodeURIComponent(url.username || 'root'),
        password: decodeURIComponent(url.password || ''),
        database: url.pathname ? url.pathname.slice(1) : 'feria_saberes',
        connectionLimit: 5,
        allowPublicKeyRetrieval: true,
      });
    } catch {
      adapter = new PrismaMariaDb(rawUrl);
    }

    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(
        'Conexión con la base de datos establecida correctamente.',
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `No se pudo conectar a la base de datos en el inicio: ${errorMessage}. Asegúrate de que MySQL esté activo.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
