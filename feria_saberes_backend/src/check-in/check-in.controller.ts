import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { Public } from '../auth/jwt-auth.guard';

@Controller('check-in')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Public()
  @Post()
  create(@Body() createCheckInDto: CreateCheckInDto) {
    return this.checkInService.create(createCheckInDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.checkInService.findAll();
  }

  @Public()
  @Get('stats')
  getStats() {
    return this.checkInService.getStats();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.checkInService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCheckInDto: UpdateCheckInDto,
  ) {
    return this.checkInService.update(id, updateCheckInDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.checkInService.remove(id);
  }
}
