import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma.module';
import { DivisionModule } from './division/division.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { ExpositoresModule } from './expositores/expositores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CheckInModule } from './check-in/check-in.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    JwtModule.register({}),
    PrismaModule,
    DivisionModule,
    ProyectosModule,
    ExpositoresModule,
    UsuariosModule,
    CheckInModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
