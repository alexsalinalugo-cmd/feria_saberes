import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  // El Reflector nos permite leer la metadata (los roles) que le pusimos al endpoint
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Buscamos qué roles definimos en el decorador @Roles()
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint no tiene el decorador @Roles(), significa que es público para cualquier logueado
    if (!rolesRequeridos) {
      return true;
    }

    // 2. Extraemos el usuario que el JwtAuthGuard inyectó en la petición
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.rol) {
      throw new ForbiddenException(
        'No tenés permisos para realizar esta acción',
      );
    }

    // 3. Verificamos si el rol del usuario coincide con alguno de los roles permitidos
    const tieneRolPermitido = rolesRequeridos.includes(user.rol);

    if (!tieneRolPermitido) {
      throw new ForbiddenException(
        'Acceso denegado: Se requieren permisos de ' +
          rolesRequeridos.join(' o '),
      );
    }

    return true;
  }
}
