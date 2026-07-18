// import { UserRoleEnum } from '../enums/user.enums.ts';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRoleEnum } from '../enums/user.enums';

interface AuthenticatedRequest extends Request {
  user?: { role: UserRoleEnum };
}

export const RoleGuard = (...roles: UserRoleEnum[]) => {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      const user = request.user;

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      if (!roles.includes(user.role)) {
        throw new ForbiddenException(
          `Access denied. Required roles: ${roles.join(', ')}`,
        );
      }

      return true;
    }
  }

  return mixin(RoleGuardMixin);
};
