import { SetMetadata } from '@nestjs/common';

// Este es el que vincula la palabra 'roles' con el array de strings que le pases
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
// roles es un array q contiene tooodos los metadatos que se le declaren a cada decorador
