import {
  CanActivate,
  ExecutionContext, // objeto que contiene toda la información de la petición actual
  Injectable,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import * as fastify from 'fastify'; //  Importamos los tipos nativos de Fastify req y res con fastify

//  DECORADOR PERSONALIZADO: Lo vamos a usar para liberar rutas del bloqueo global
// IS_PUBLIC_KEY = 'isPublic'; es el metadato que le agregamos a la rutas personalizadas que es isPublic y true
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

//al poner implements CanActivate esta clase retorna true(pasa) o false(no pasa)
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector, // El reflector sirve para leer los metadatos de las rutas
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // reflector lee los metadatos de las rutas
    // 1. va y busca ¿La ruta que ´pide tiene el decorador @Public()?
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      //esto es para q busque en los controller enteros y sus metodos
      context.getHandler(), // apunta al controller entero (la clase).
      context.getClass(), //apunta al método específico dentro de ese controller.
    ]);
    //publica? pasa de one
    if (isPublic) return true;

    // 2. Si es privada, capturamos la petición de Fastify la req entera .switchToHttp() le dice a 'nest dejamelo a mi a la req'
    const request = context
      .switchToHttp()
      .getRequest<fastify.FastifyRequest & { user?: any }>();
    const token = this.extractTokenFromHeader(request);

    // Si ni siquiera mandó el token en los headers, rebote inmediato
    if (!token) {
      throw new UnauthorizedException('No se proporcionó un token de acceso');
    }
    try {
      // 3. Verificamos el Access Token de 15 minutos con su clave secreta
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      request['user'] = payload;
    } catch {
      // Si el token expiró o se modificó un solo carácter, tira error
      throw new UnauthorizedException('Token de acceso inválido o expirado');
    }

    return true;
  }
  // Función auxiliar para cortar el string 'Bearer <token>' y quedarnos solo con el código
  //   Esta es una función de apoyo (un "helper").
  //   Su único laburo es ir a buscar el token al sobre de los headers de Fastify y limpiarlo, porque el Front no te manda
  //   el token solo; por estándar de seguridad te lo manda así:
  //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  private extractTokenFromHeader(
    request: fastify.FastifyRequest,
  ): string | undefined {
    // 1. Va a los headers de Fastify y busca la propiedad 'authorization'
    const authorizationHeader = request.headers.authorization;

    // 2. Si el Front se olvidó de mandar el header, devuelve 'undefined' (el Guard va a rebotar la petición)
    if (!authorizationHeader) return undefined;

    // 3. LA SEPARACIÓN: El texto es "Bearer eyJhbGci...".
    // Al hacer .split(' ') usando el ESPACIO en blanco como tijera, lo corta en dos partes
    // La parte 0 es el string "Bearer" -> se guarda en la variable 'type'
    // La parte 1 es el chorizo de código del token -> se guarda en la variable 'token'
    const [type, token] = authorizationHeader.split(' ');

    // 4. LA COMPROBACIÓN: Se fija si la primera parte es efectivamente la palabra "Bearer".
    // Si es así, te devuelve el 'token' limpito listo para verificar. Si es cualquier otra cosa, tira undefined.
    return type === 'Bearer' ? token : undefined;
  }
}
