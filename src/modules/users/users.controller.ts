import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard, CurrentUser } from '~/modules/auth';
import { UserEntity } from './users.entity';

@Controller('users')
export class UsersController {
  constructor() {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: UserEntity) {
    return user;
  }
}
