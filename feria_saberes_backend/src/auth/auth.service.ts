import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { logindto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { registrerdto } from './dto/registrer.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async login(logindto: logindto) {
    const user = await this.prisma.usuarios.findUnique({
      where: { dni: logindto.dni },
    });
    if (!user) {
      throw new UnauthorizedException(
        'Credenciales inválidas o usuario inactivo',
      );
    }
    // aca cuando completemos lo de registro hay que comparar con la contraseña encrirptada que la desencriptamos con la libreria
    // bcrypt y asi comparamos con las q nos envian pero x ahora asi no mas medio asi
    //   const isPasswordValid = await bcrypt.compare(
    //   logindto.password, // Lo que escribió el usuario en el login
    //   user.password_hash, // El hash guardado en la base de datos
    // );

    // // 3. Si la contraseña no coincide, lanzamos el error
    // if (!isPasswordValid) {
    //   throw new UnauthorizedException(
    //     'Credenciales inválidas o usuario inactivo',
    //   );
    // }
    if (user.contrasena != logindto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = {
      sub: user.id,
      nombre: user.nombre,
      rol: user.rol,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    // Firmamos el Refresh Token (Solo lleva el ID y dura 7 días)
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
      },
    };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.prisma.usuarios.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      const nuevoAccess = this.jwtService.sign(
        {
          sub: user.id,
          nombre: user.nombre,
          rol: user.rol,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      );

      return {
        accessToken: nuevoAccess,
        user: {
          id: user.id,
          nombre: user.nombre,
          rol: user.rol,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('refresh invalido');
    }
  }
  async registrer(usuario: registrerdto) {
    const VerificarUsuario = await this.prisma.usuarios.findUnique({
      where: {
        dni: usuario.dni,
      },
    });
    if (VerificarUsuario)
      throw new BadRequestException(
        `Ya tenés estas registrado ${VerificarUsuario?.nombre}.`,
      );
    const saltRounds = 10;
    const contraseñaEncriptada = await bcrypt.hash(
      usuario.contraseña,
      saltRounds,
    );
    const usuarioNuevo = await this.prisma.usuarios.createMany({
      data: {
        nombre: usuario.nombre,
        dni: usuario.dni,
        contrasena: contraseñaEncriptada,
      },
    });
    return {
      mensaje: 'Usuario registrado exitosamente',
    };
  }
}
