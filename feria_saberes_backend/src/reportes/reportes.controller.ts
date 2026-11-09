import { Controller, Get } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Public } from '../auth/jwt-auth.guard';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Public()
  @Get()
  getDashboard() {
    return this.reportesService.getDashboardReportes();
  }

  @Public()
  @Get('dashboard')
  getDashboardAlias() {
    return this.reportesService.getDashboardReportes();
  }
}
