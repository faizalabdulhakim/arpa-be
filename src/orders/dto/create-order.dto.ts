import { Status } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateOrderDto {
  user_id: string;
  status: Status;
  products: ProductDto[];
}

export class ProductDto {
  product_id: string;

  @IsNumber()
  @Transform(({ value }) => {
    return Number(value);
  })
  quantity: number;
}
