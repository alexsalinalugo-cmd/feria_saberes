import { Module } from '@nestjs/common';
import { ExpositoresService } from './expositores.service';
import { ExpositoresController } from './expositores.controller';

@Module({
  controllers: [ExpositoresController],
  providers: [ExpositoresService],
})
export class ExpositoresModule {}
