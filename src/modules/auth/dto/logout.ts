import { IsUUID } from 'class-validator';

export class Logout {
  @IsUUID()
  userId: string;
}
