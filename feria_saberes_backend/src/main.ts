import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyMultipart from '@fastify/multipart';

async function bootstrap() {
  // Aquí le decimos a Nest: "Usa Fastify en lugar de Express"
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // Límite de 10 MB por archivo
    },
  });
  // // // // Los DTOs siguen siendo únicos de cada módulo, pero el "Guardián" que los lee es global.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Borra del objeto cualquier propiedad extraña que mande el Front
      forbidNonWhitelisted: true, // Tira error si mandan datos que no están en el DTO
      transform: true, // Intenta transformar los tipos automáticamente (ej. string a number si puede)
      exceptionFactory: (errors) => {
        console.log(
          '--- ERRORES DE VALIDACION ---',
          JSON.stringify(errors, null, 2),
        );
        return new BadRequestException(errors);
      },
    }),
  );
  // REGISTRAR COOKIES EN FASTIFY
  await app.register(fastifyCookie, {
    secret: process.env.JWT_REFRESH_SECRET, // Usa tu clave secreta para firmar las cookies si querés
  });
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProduction ? ['https://dominio.com.ar'] : true,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Importante: Fastify necesita '0.0.0.0' para escuchar conexiones externas
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Servidor de la feria corriendo en http://localhost:${port}`);
}
void bootstrap();
