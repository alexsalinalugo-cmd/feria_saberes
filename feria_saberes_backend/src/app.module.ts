import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma.module';
import { DivisionModule } from './division/division.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { ExpositoresModule } from './expositores/expositores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CheckInModule } from './check-in/check-in.module';

@Module({
  imports: [
    PrismaModule,
    DivisionModule,
    ProyectosModule,
    ExpositoresModule,
    UsuariosModule,
    CheckInModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
