import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '~/common/database/base.entity';
import { UserEntity } from '../users';

@Entity('refreshTokens')
export class RefreshTokenEntity extends BaseEntity {
  @Column({ unique: true })
  jti: string;

  @Column()
  token: string;

  @Column()
  userId: string;

  @Column({
    type: 'timestamp with time zone',
  })
  expiresAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.refreshToken)
  user: UserEntity;
}
