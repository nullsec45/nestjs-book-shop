import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Role } from "@/auth/role.enum";

export const CurrentRole=createParamDecorator(
    (
        data:unknown, ctx : ExecutionContext
    ) : Role | undefined => {
        const req = ctx.switchToHttp().getRequest();
        return req.user?.role;
    }
)