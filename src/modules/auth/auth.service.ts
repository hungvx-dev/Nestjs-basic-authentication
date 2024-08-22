import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { Response } from 'express';
import { nanoid } from 'nanoid';

import { UserEntity, UsersService, CreateUserDto } from '~/modules/users';
import { Token } from './enums';
import { JwtPayload } from './interfaces/token-payload.interface';
import { Tokens } from './interfaces/tokens.interface';
import { RefreshTokenEntity, RefreshTokensService } from '../refresh-tokens';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly refreshTokensService: RefreshTokensService,
  ) {}

  async signup(res: Response, createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    await this.generateAndSaveTokens(res, user.id);
    return user;
  }

  async signin(res: Response, user: UserEntity) {
    await this.generateAndSaveTokens(res, user.id);
    return user;
  }

  async refreshTokens(res: Response, encryptedRefreshToken: string) {
    const refreshTokenEntity = await this.refreshTokensService.findByJti(
      this.getRefreshTokenJti(encryptedRefreshToken),
    );
    if (!refreshTokenEntity) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const isValidToken = await this.refreshTokensService.validateRefreshToken(
      refreshTokenEntity.token,
      encryptedRefreshToken,
    );
    if (!isValidToken) {
      throw new ForbiddenException('Access Denied');
    }

    await this.reGenerateAndUpdateTokens(res, refreshTokenEntity);
  }

  async signout(res: Response, encryptedRefreshToken: string) {
    await this.refreshTokensService.deleteByJti(
      this.getRefreshTokenJti(encryptedRefreshToken),
    );

    res
      .clearCookie(Token.Access, {
        httpOnly: true,
        sameSite: 'strict',
      })
      .clearCookie(Token.Refresh, {
        httpOnly: true,
        sameSite: 'strict',
      });
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersService.getUserByEmail(email);
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return user;
  }

  private async generateAndSaveTokens(
    res: Response,
    userId: string,
  ): Promise<void> {
    const jti = nanoid(10);
    const accessToken = this.generateAccessToken({ sub: userId });
    const refreshToken = this.generateRefreshToken({ jti, sub: userId });
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + this.configService.get('JWT_REFRESH_EXPIRATION'),
    );

    await this.refreshTokensService.createToken({
      jti,
      userId,
      token: refreshToken,
      expiresAt: expiresAt,
    });
    this.setTokensInCookies(res, { accessToken, refreshToken }, expiresAt);
  }

  private async reGenerateAndUpdateTokens(
    res: Response,
    { id, userId, jti, expiresAt }: RefreshTokenEntity,
  ) {
    const accessToken = this.generateAccessToken({ sub: userId });
    const refreshToken = this.reGenerateRefreshToken(
      { jti, sub: userId },
      expiresAt,
    );

    await this.refreshTokensService.updateToken(id, refreshToken);
    this.setTokensInCookies(res, { accessToken, refreshToken }, expiresAt);
  }

  private setTokensInCookies(
    res: Response,
    { accessToken, refreshToken }: Tokens,
    expiresAt: Date,
  ) {
    this.setAccessTokenInCookie(res, accessToken);
    this.setRefreshTokenInCookie(res, refreshToken, expiresAt);
  }

  private setAccessTokenInCookie(res: Response, accessToken: string) {
    res.cookie(Token.Access, accessToken, {
      expires: new Date(
        Date.now() + this.configService.get('JWT_EXPIRATION') * 1000,
      ),
      httpOnly: true,
      sameSite: 'strict',
    });
  }

  private setRefreshTokenInCookie(
    res: Response,
    refreshToken: string,
    expires: Date,
  ) {
    res.cookie(Token.Refresh, refreshToken, {
      expires,
      httpOnly: true,
      sameSite: 'strict',
    });
  }

  encrypt(data: string | number | object): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.configService.get('SECRET_KEY'),
    ).toString();
  }

  decrypt(cipherText: string): string | null {
    if (cipherText) {
      const bytes = CryptoJS.AES.decrypt(
        cipherText,
        this.configService.get('SECRET_KEY'),
      );
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    return null;
  }

  private generateAccessToken(jwtPayload: JwtPayload): string {
    return this.encrypt(this.jwtService.sign(jwtPayload));
  }

  private generateRefreshToken(jwtPayload: JwtPayload): string {
    return this.encrypt(
      this.jwtService.sign(jwtPayload, {
        expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRATION')}d`,
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }),
    );
  }

  private reGenerateRefreshToken(
    jwtPayload: JwtPayload,
    oldExpiresAt: Date,
  ): string {
    return this.encrypt(
      this.jwtService.sign(jwtPayload, {
        expiresIn: Math.floor((oldExpiresAt.getTime() - Date.now()) / 1000),
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }),
    );
  }

  private getRefreshTokenJti(encryptedToken: string): string {
    const refreshToken = this.decrypt(encryptedToken);
    const { jti } = this.jwtService.verify<JwtPayload>(refreshToken);
    return jti;
  }
}
