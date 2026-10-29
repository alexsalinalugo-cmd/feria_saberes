import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionUrl =
      process.env.DATABASE_URL || 'mysql://root:@localhost:3306/feria_saberes';

    const adapter = new PrismaMariaDb(connectionUrl);
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
        `No se pudo establecer la conexión inicial con la base de datos: ${errorMessage}. Asegúrate de que el servicio MySQL/MariaDB esté activo.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
