import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from 'src/dtos/order/create-order.dto';
import { PaginationDto } from 'src/dtos/pagination/pagination.dto';
import { OrderStatus } from 'src/enums/order-status.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  async findAllAndPagination(dto: {
    page: string;
    take: string;
    searchValue: string;
  }): Promise<any> {
    const { page = 1, take = 5, searchValue = '' } = dto;

    // Xác định điều kiện tìm kiếm cho trường status
    let statusFilter: OrderStatus | undefined;
    if (
      searchValue &&
      Object.values(OrderStatus).includes(searchValue as OrderStatus)
    ) {
      statusFilter = searchValue as OrderStatus;
    }

    const totalOrder = await this.prismaService.order.findMany({
      where: {
        status: statusFilter,
      },
    });

    const totalPage = Math.ceil(totalOrder.length / +take);

    const orders = await this.prismaService.order.findMany({
      where: {
        status: statusFilter,
      },
      take: +take,
      skip: (+page - 1) * +take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      totalPage: totalPage,
      totalOrder: totalOrder,
      currentPage: page,
      limit: take,
      orders: orders,
    };
  }

  async findAllByUser(userId: string, dto: PaginationDto) {
    const { page = 1, take = 5, searchValue = '' } = dto;
    const totalOrder = await this.prismaService.order.findMany({
      where: {
        userId: userId,
      },
    });

    const totalPage = Math.ceil(+totalOrder.length / +take);

    const orders = await this.prismaService.order.findMany({
      where: {
        userId: userId,
      },
      take: +take,
      skip: (+page - 1) * +take,
      orderBy: {
        orderDate: 'desc',
      },
    });
    return {
      totalPage: totalPage,
      totalOrder: totalOrder,
      currentPage: page,
      limit: take,
      orders: orders,
    };
  }

  async findOrderDetailsByOrderId(orderId: string) {
    const orderDetail = await this.prismaService.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return orderDetail;
  }

  async create(dto: CreateOrderDto): Promise<null> {
    const { totalAmount, note, userId, orderItems } = dto;

    // tạo đơn hàng
    await this.prismaService.order.create({
      data: {
        orderDate: new Date(),
        totalAmount,
        note,
        user: {
          connect: { id: userId },
        },
        orderItems: {
          create: orderItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            product: {
              connect: { id: item.productId },
            },
          })),
        },
      },
    });

    return null;
  }

  async update(orderId: string, status: OrderStatus) {
    await this.prismaService.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
      },
    });
    return null;
  }
}
