import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { logindto } from './dto/login.dto';
import * as fastify from 'fastify'; //  Importamos los tipos nativos de Fastify req y res con fastify
import { Public } from './jwt-auth.guard';
import { registrerdto } from './dto/registrer.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  async create(
    @Body() createAuthDto: logindto,
    @Res({ passthrough: true }) reply: fastify.FastifyReply,
  ) {
    // Inyectamos la respuesta de Fastify passthrough: true para q nest nos deje meter mano en el res)
    const logueo = await this.authService.login(createAuthDto);
    const isProduction = process.env.NODE_ENV === 'production';
    reply.setCookie('refresh_token', logueo.refreshToken, {
      httpOnly: true, // 🔒 Clave: Evita que JS en el Front acceda a la cookie
      secure: isProduction, // 🛑 Ponelo en 'true' solo cuando pases a producción con HTTPS (en local va false)
      sameSite: 'lax', // Protege contra ataques CSRF
      path: '/auth', // 🎯 La cookie SOLO se envía cuando el Front consulte rutas que arranquen con /auth
      // domain: 'gymarafyfy.com.ar',
      maxAge: 7 * 24 * 60 * 60, // Duración: 7 días en segundos
    });
    return {
      accessToken: logueo.accessToken,
      user: logueo.user,
    };
  }
  @Public()
  @Post('refresh')
  async refresh(@Req() request: fastify.FastifyRequest) {
    //Inyectamos la petición de Fastify para leer cookies
    // 1. Buscamos la cookie que guardó el navegador
    const refreshToken = request.cookies['refresh_token'];

    // Si no existe la cookie, al lobby directamente
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token no proporcionado en las cookies',
      );
    }
    // 2. Le mandamos el token al servicio para que nos dé un Access Token nuevo
    return this.authService.refresh(refreshToken);
  }
  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) reply: fastify.FastifyReply) {
    reply.clearCookie('refresh_token', { path: '/auth' });
    return { message: 'Sesión cerrada correctamente' };
  }
  @Public() // este hay que sacar porque el registro lo hacen los admins
  @Post('registrer')
  async registrer(@Body() usuario: registrerdto) {
    return this.authService.registrer(usuario);
  }
}
