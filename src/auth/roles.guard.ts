import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '@/user/user.service';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '@/auth/role.enum';
import { LogService } from '@/common/logger.service';

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(
        private reflector:Reflector,
        private userService:UserService,
        private logger:LogService,
    ){}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const required=this.reflector.getAllAndOverride<Role[]>(ROLES_KEY,[
            ctx.getHandler(),
            ctx.getClass(),
        ]);

        if (!required || required.length == 0) return true;

        const req=ctx.switchToHttp().getRequest();
        const user=req.user;
        if(!user?.id){
            throw new ForbiddenException('Unauthorized');
        }

        const userRole=await this.userService.getRoleByUserId(user.id);

        req.user = {
            role: userRole as Role,
        };

        const allowed=required.includes(userRole as Role);

        if(!allowed){
            this.logger.module('activity').warn('forbidden.access', {
                url: req.url,
                method: req.method,
                reason: 'Insufficient role',
                user_id:req.user.id,
            },'warn');
        }

        
        if(!allowed) throw new ForbiddenException('Insufficient role');
        return true;
    }
}