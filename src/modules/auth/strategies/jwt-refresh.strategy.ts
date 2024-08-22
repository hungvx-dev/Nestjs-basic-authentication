import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserEntity, UsersService } from '~/modules/users';
import { JwtPayload } from '../interfaces/token-payload.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          this.authService.decrypt(request?.cookies?.refreshToken),
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate({ sub }: JwtPayload): Promise<UserEntity> {
    try {
      return await this.usersService.findOne(sub);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
