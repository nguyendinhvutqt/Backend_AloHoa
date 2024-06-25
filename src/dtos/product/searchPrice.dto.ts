import { IsNumber } from 'class-validator';

export class SearchProductByPrice {
  @IsNumber()
  minPrice: number;

  @IsNumber()
  maxPrice: number;
}
