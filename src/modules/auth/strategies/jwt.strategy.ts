import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { UserEntity, UsersService } from '~/modules/users';
import { JwtPayload } from '../interfaces/token-payload.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          this.authService.decrypt(request?.cookies?.accessToken),
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate({ sub }: JwtPayload): Promise<UserEntity> {
    try {
      return this.usersService.findOne(sub);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
