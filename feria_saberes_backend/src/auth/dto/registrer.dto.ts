import { IsNotEmpty, IsString, Length } from 'class-validator';

export class registrerdto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre!: string;
}
