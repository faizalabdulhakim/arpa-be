import { Status } from '@prisma/client';

export class CreateOrderDto {
  user_id: string;
  status: Status;
  products: {
    product_id: string;
    quantity: number;
  }[];
}
