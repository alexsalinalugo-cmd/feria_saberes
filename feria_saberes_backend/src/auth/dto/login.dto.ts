import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class logindto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;
  @IsString()
  @IsNotEmpty({ message: 'el dni es requerida' })
  dni!: string;
}
