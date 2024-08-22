import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenEntity } from './refresh-tokens.entity';
import { RefreshTokenPayload } from './interfaces';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async createToken(payload: RefreshTokenPayload) {
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(payload.token, salt);

    return this.refreshTokenRepository.save({
      ...payload,
      token: hashedToken,
    });
  }

  findByJti(jti: string): Promise<RefreshTokenEntity | null> {
    return this.refreshTokenRepository.findOne({ where: { jti } });
  }

  async updateToken(id: string, token: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(token, salt);
    await this.refreshTokenRepository.update({ id }, { token: hashedToken });
  }

  async delete(id: string) {
    await this.refreshTokenRepository.delete({ id });
  }

  async deleteByJti(jti: string) {
    await this.refreshTokenRepository.delete({ jti });
  }

  validateRefreshToken(
    storedHash: string,
    providedToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(providedToken, storedHash);
  }

  @Cron(CronExpression.EVERY_WEEKEND)
  async cleanupToken() {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
