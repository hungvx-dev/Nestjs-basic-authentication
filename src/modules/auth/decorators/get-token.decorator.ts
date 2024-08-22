import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Tokens } from '../interfaces/tokens.interface';

const getTokenType = (
  type: keyof Tokens,
  context: ExecutionContext,
): string => {
  const req = context.switchToHttp().getRequest();
  return req.cookies[type];
};

export const GetToken = createParamDecorator(
  (data: keyof Tokens, context: ExecutionContext) =>
    getTokenType(data, context),
);
