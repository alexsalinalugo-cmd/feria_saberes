import { Module } from '@nestjs/common';
import { AdministracionService } from './administracion.service';
import { AdministracionController } from './administracion.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [AdministracionController],
  providers: [AdministracionService, RolesGuard],
})
export class AdministracionModule {}
