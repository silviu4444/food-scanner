import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { JwtUser } from '../interfaces/auth.interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
        return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: JwtUser = request.user;

    if (!user || !roles.includes(user.sub.role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
