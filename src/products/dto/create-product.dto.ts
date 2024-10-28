import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  name: string;
  image: string;
  description: string;

  @IsNumber()
  @Transform(({ value }) => {
    return Number(value);
  })
  price: number;

  @IsNumber()
  @Transform(({ value }) => {
    return Number(value);
  })
  stock: number;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  categories: string[];
}
