import { Module } from '@nestjs/common';

import { DatabaseModule } from '~/common';
import { UserEntity, UsersController, UsersService } from '.';

@Module({
  imports: [DatabaseModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
