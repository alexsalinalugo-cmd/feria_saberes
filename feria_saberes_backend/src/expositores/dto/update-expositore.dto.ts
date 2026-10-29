import { PartialType } from '@nestjs/mapped-types';
import { CreateExpositoreDto } from './create-expositore.dto';

export class UpdateExpositoreDto extends PartialType(CreateExpositoreDto) {}
