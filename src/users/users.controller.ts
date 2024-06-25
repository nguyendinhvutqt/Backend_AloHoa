import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDto } from 'src/dtos/user/update';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get()
  async findAll() {
    const res = await this.usersService.findAll();
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User, Role.Admin)
  @Post('update')
  async update(@Body() dto: UpdateUserDto, @Request() req) {
    const res = await this.usersService.update(dto, req.user.userId);
    return {
      status: HttpStatus.OK,
      message: 'Cập nhật thông tin thành công',
      data: res,
    };
  }
}
