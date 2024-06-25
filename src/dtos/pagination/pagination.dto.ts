import { IsNumberString, IsOptional } from 'class-validator';
import { OrderStatus } from 'src/enums/order-status.enum';

export class PaginationDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  take?: string;

  @IsOptional()
  searchValue?: string | OrderStatus;
}
