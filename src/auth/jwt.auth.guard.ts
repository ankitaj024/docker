import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_ADMIN_KEY, IsAdmin } from './admin.decorator';
import { Access_Denied, Token_Expires } from 'src/utils/constants';


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    try {
      const canActivate = await super.canActivate(context);
      if (!canActivate) {
        return false;
      }
    } catch (error) {
      if (
        error instanceof UnauthorizedException &&
        error.message === 'jwt expired'
      ) {
        throw new ForbiddenException(Token_Expires);
      }
      throw error;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (isAdmin) {
      if (user.isAdmin) {
        return true;
      } else {
        throw new ForbiddenException(Access_Denied);
      }
    }
    return true;
  }
}
