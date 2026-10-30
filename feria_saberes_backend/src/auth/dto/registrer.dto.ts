import { IsNotEmpty, IsString } from 'class-validator';

export class registrerdto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  contraseña!: string;
  @IsString()
  @IsNotEmpty({ message: 'el email es requerida' })
  dni!: string;
  @IsString()
  @IsNotEmpty({ message: 'el nombre es requerido' })
  nombre!: string;
}
