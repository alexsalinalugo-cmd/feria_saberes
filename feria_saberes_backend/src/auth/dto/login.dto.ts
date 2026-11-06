import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class logindto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;
  @IsString()
  @IsNotEmpty({ message: 'el nombre es requerido' })
  nombre!: string;
}
