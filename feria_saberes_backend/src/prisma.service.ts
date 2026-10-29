import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url = new URL(process.env.DATABASE_URL!);

    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      connectionLimit: 5,
      allowPublicKeyRetrieval: true,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
// ===========================================================
// 🛠️ COMPONENTE: PRISMA SERVICE (GESTIÓN DE CONEXIÓN)
// ===========================================================

// ARCHIVO: src/prisma.service.ts

// -----------------------------------------------------------
// 1. @Injectable()
// -----------------------------------------------------------
// Define la clase como un 'Provider'. Permite que NestJS gestione
// la instancia de forma automática (Singleton) y la inyecte en
// los constructores de otros servicios sin usar 'new'.

// -----------------------------------------------------------
// 2. extends PrismaClient
// -----------------------------------------------------------
// Aplica 'Herencia'. El PrismaService hereda todos los métodos
// del cliente generado (findMany, create, update, delete).
// Convierte a la clase en el motor de consultas de la base de datos.

// -----------------------------------------------------------
// 3. implements OnModuleInit, OnModuleDestroy
// -----------------------------------------------------------
// Uso de 'Lifecycle Hooks' (Interfaces de ciclo de vida):

// - onModuleInit(): Función asíncrona que NestJS ejecuta al
//   arrancar el servidor. Ejecuta 'this.$connect()' para abrir
//   el socket de conexión con MySQL.

// - onModuleDestroy(): Función asíncrona que NestJS ejecuta al
//   apagar el servidor. Ejecuta 'this.$disconnect()' para liberar
//   recursos y cerrar la sesión en MySQL de forma limpia.

// -----------------------------------------------------------
// 4. FLUJO DE DATOS (Arquitectura)
// -----------------------------------------------------------
// MySQL <---> PrismaService (Client) <---> Services <---> Controller

// -----------------------------------------------------------
// 5. CÓDIGO FUENTE (Copiable)
// -----------------------------------------------------------
// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
//   async onModuleInit() {
//     await this.$connect();
//   }

//   async onModuleDestroy() {
//     await this.$disconnect();
//   }
// }
// ===========================================================
