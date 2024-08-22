import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '~/common/database/base.entity';
import { RefreshTokenEntity } from '../refresh-tokens';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Index()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  lastActivatedAt: Date;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshToken: RefreshTokenEntity;
}
