import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { checkin_categoria } from '../../generated/prisma/client';

export class CreateCheckInDto {
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsEnum(checkin_categoria, {
    message: 'La categoría debe ser: familiar, alumno, docente u otro',
  })
  categoria: checkin_categoria;

  @Type(() => Number)
  @IsInt({ message: 'La cantidad de integrantes debe ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 integrante' })
  integrantes: number;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(150, { message: 'El nombre no puede superar los 150 caracteres' })
  nombre?: string;
}
