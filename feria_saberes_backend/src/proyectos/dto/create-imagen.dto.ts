import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateImagenDto {
  @IsOptional() // 👈 AGREGAR ESTO
  @IsNumber()
  @IsNumber()
  id?: number;
  @IsString()
  url_imagen!: string;
  @IsBoolean()
  es_principal!: boolean;
}
