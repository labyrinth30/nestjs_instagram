import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate{
  constructor(
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext):  Promise<boolean> {
    /**
     * Roles annotation에 대한 metadata를 가져온다.
     *
     * Reflector
     * getAllAndOverride() -> 모든 metadata를 가져
     */
    const requiredRole = this.reflector.getAllAndOverride(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );
    // Roles Annotation이 없는 경우 패스
    if(!requiredRole){
      return true;
    }

    const {user} = context.switchToHttp().getRequest();
    if(!user){
      throw new UnauthorizedException('토큰을 제공해주세요!');
    }

    if(user.role !== requiredRole){
      throw new ForbiddenException(`이 작업을 수행할 권한이 없습니다. ${requiredRole} 권한이 필요합니다.`);
    }
    return true;
  }
}