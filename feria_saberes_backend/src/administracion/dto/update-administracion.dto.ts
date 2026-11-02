import { PartialType } from '@nestjs/mapped-types';
import { CreateAdministracionDto } from './create-administracion.dto';

export class UpdateAdministracionDto extends PartialType(CreateAdministracionDto) {}
