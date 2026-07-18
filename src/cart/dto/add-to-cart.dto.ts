import { IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Length, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  @Length(24, 24)
  productId: string;

  @IsNumber()
  @IsInt()
  @Min(1, { message: 'Quantity must be a positive number' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity!: number;
}
