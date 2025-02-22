import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRoleEnum } from '@prisma/client';
import { JwtGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from './roles.decorator';

export function HasRoles(roles: UserRoleEnum[]) {
  return applyDecorators(Roles(roles), UseGuards(JwtGuard, RolesGuard));
}
