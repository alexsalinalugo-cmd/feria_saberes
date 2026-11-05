import { IsNumber } from 'class-validator';

export class UpdateProyectoDto {
  @IsNumber()
  proyectoId!: number;
  @IsNumber()
  puntuacion!: number;
}
