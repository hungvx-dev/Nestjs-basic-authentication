export interface RefreshTokenPayload {
  userId: string;
  token: string;
  jti: string;
  expiresAt: Date;
}
