import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Shipping Address is required' })
  shippingAddress!: string;

  @IsString()
  @IsOptional()
  couponCode?: string;
}
