import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/dtos/auth/register.dto';

import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // regex email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(dto.email);
    if (!isEmail) {
      throw new HttpException('Email không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    // check email exist
    const emailIsExixst = await this.usersService.findByEmail(dto.email);
    if (emailIsExixst) {
      throw new HttpException('Email đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    // check password biger more than 5 character
    if (dto.password.length < 5) {
      throw new HttpException(
        'Mật khẩu phải không được nhỏ hơn 5 kí tự',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check confirmPassword equal password
    if (dto.password !== dto.confirmPassword) {
      throw new HttpException(
        'Xác nhận mật khẩu không khớp',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.usersService.create(dto);
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user?.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      username: user.name,
      address: user.address,
      phone: user.phone,
    };
    return {
      user: payload,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
