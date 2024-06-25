import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsString()
  note?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsNotEmpty()
  orderItems: CreateOrderItemDto[];
}
