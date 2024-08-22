import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';

import { UsersModule, RefreshTokensModule, AuthModule } from '~/modules';
import { DatabaseModule, LoggerModule } from '~/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),

        SECRET_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.number().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION: Joi.number().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    LoggerModule,
    DatabaseModule,
    UsersModule,
    RefreshTokensModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
