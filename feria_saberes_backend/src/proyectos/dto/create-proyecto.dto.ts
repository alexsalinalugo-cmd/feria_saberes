import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateImagenDto } from './create-imagen.dto';
export class CreateProyectoDto {
  @IsNotEmpty({ message: 'el titulo es obligatorio es obligatoria' })
  @IsString({ message: 'El titulo debe ser una cadena de texto' })
  @MaxLength(255)
  titulo!: string;
  @IsString({ message: 'la descripcion debe ser una cadena de texto' })
  @MaxLength(5000)
  descripcion!: string;
  @IsNotEmpty({ message: 'el id de la division es obligatorio' })
  @IsNumber()
  division_id!: number;

  // 1. Array de imágenes anidadas
  @IsArray()
  @ValidateNested({ each: true }) // 👈 Valida cada objeto del array
  @Type(() => CreateImagenDto) // 👈 Transforma el JSON a la clase DTO
  @IsOptional()
  @ArrayMaxSize(10, { message: 'El proyecto puede tener hasta 10 imágenes.' })
  imagenes?: CreateImagenDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(150, { each: true })
  expositores?: string[];
}
