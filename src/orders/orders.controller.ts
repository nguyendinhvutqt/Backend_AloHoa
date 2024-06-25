import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from 'src/dtos/order/create-order.dto';
import { OrderStatus } from 'src/enums/order-status.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { PaginationDto } from 'src/dtos/pagination/pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('pagination')
  async findAllAndPagination(
    @Query() dto: { page: string; take: string; searchValue: OrderStatus },
  ) {
    const res = await this.ordersService.findAllAndPagination(dto);
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Get('/detail/:id')
  async findOrderDetailsByOrderId(@Param('id') id: string) {
    const res = await this.ordersService.findOrderDetailsByOrderId(id);
    return { status: HttpStatus.OK, message: null, data: res };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Post('create')
  async CreateOrder(@Body() dto: CreateOrderDto) {
    const res = await this.ordersService.create(dto);
    return {
      status: HttpStatus.CREATED,
      message: 'Đặt hàng thành công',
      data: res,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Get('user')
  async findAllByUser(@Query() dto: PaginationDto, @Request() req) {
    const res = await this.ordersService.findAllByUser(req.user.userId, dto);
    return { status: HttpStatus.OK, messgae: null, data: res };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() dto: { status: OrderStatus }) {
    const res = await this.ordersService.update(id, dto.status);
    return {
      status: HttpStatus.OK,
      message: 'Cập nhật trạng thái thành công',
      data: res,
    };
  }
}
