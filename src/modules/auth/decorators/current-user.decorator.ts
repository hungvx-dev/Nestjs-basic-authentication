import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserEntity } from '~/modules/users';

const getCurrentUserByContext = (context: ExecutionContext): UserEntity => {
  return context.switchToHttp().getRequest().user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
