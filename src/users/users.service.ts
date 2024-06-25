import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from 'src/dtos/auth/register.dto';
import { UpdateUserDto } from 'src/dtos/user/update';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findAll(): Promise<any> {
    const users = await this.prismaService.user.findMany({
      where: {
        role: 'User',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
      },
    });
    return users;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });
  }

  async create(dto: RegisterDto) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(dto.password, saltOrRounds);
    const createUser = await this.prismaService.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.email,
      },
    });
    return createUser;
  }

  async update(dto: UpdateUserDto, userId: string): Promise<User> {
    const updateUser = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        name: dto.username,
        address: dto.address,
        phone: dto.phone,
      },
    });
    return updateUser;
  }
}
