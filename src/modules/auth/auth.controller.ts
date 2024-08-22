import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { UserEntity, CreateUserDto } from '~/modules/users';
import { AuthService } from './auth.service';
import { LocalAuthGuard, JwtRefreshAuthGuard } from './guards';
import { CurrentUser } from './decorators/current-user.decorator';
import { GetToken } from './decorators/get-token.decorator';
import { Token } from './enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.signin(response, user);
    response.send(user);
  }

  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.signup(response, createUserDto);
    response.send(user);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshTokens(
    @CurrentUser() user: UserEntity,
    @GetToken(Token.Refresh) refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.refreshTokens(response, refreshToken);
    response.send(user);
  }

  @Post('signout')
  async signout(
    @GetToken(Token.Refresh) refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.signout(response, refreshToken);
  }
}
