import { Module } from '@nestjs/common';

import { DatabaseModule } from '~/common';
import {
  RefreshTokenEntity,
  RefreshTokensController,
  RefreshTokensService,
} from '.';

@Module({
  imports: [DatabaseModule.forFeature([RefreshTokenEntity])],
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
