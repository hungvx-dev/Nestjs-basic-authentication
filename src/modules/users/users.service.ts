import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    await this.validateCreateUserDto(createUserDto);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    return this.usersRepository.save({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  getUserByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ email });
  }

  findOne(id: string) {
    return this.usersRepository.findOneBy({ id });
  }

  private async validateCreateUserDto({ email }: CreateUserDto) {
    const user = await this.usersRepository.findOneBy({ email });

    if (user) {
      throw new UnprocessableEntityException('Email already exist');
    }
  }
}
