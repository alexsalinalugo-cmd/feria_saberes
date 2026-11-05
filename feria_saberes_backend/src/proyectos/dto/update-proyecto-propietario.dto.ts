import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProyectoImagenActualizadaDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  @MaxLength(500)
  url_imagen!: string;

  @IsBoolean()
  es_principal!: boolean;
}

export class UpdateProyectoPropietarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descripcion?: string;

  @IsNumber()
  division_id!: number;

  @IsArray()
  @ArrayMaxSize(10, { message: 'El proyecto puede tener hasta 10 imágenes.' })
  @ValidateNested({ each: true })
  @Type(() => ProyectoImagenActualizadaDto)
  imagenes!: ProyectoImagenActualizadaDto[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(150, { each: true })
  expositores!: string[];
}
