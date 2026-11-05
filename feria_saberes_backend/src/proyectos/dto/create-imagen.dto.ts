import { IsString, IsBoolean } from 'class-validator';

export class CreateImagenDto {
  @IsString()
  url_imagen!: string;
  @IsBoolean()
  es_principal!: boolean;
}
