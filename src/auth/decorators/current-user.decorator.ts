import { ExecutionContext, ForbiddenException, InternalServerErrorException, createParamDecorator } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ValidRoles } from "src/enums/valid-roles.enums";
import { User } from "src/users/entities/user.entity";

export const CurrentUser = createParamDecorator(
    (roles: ValidRoles[] = [], context: ExecutionContext) => {
        const ctx = GqlExecutionContext.create(context);
        const user: User = ctx.getContext().req.user;
        if (!user) throw new InternalServerErrorException('No user inside the request');
        if (roles.length === 0) return user;
        for (const role of user.role) {
            if (roles.includes(role as ValidRoles)) return user;
        }
        throw new ForbiddenException(`User with role ${user.role} is not allowed to access this resource`);
    });