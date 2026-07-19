import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty({ message: 'Coupon code is required' })
  code!: string;

  @IsInt()
  @IsNotEmpty({ message: 'Coupon code is required' })
  @Max(100, { message: 'Discount cannot exceed 100%.' })
  discountPercentage!: number;

  @IsDateString({}, { message: 'Expiry Date must be a valid ISO date string' })
  expiryDate!: number;

  @IsInt()
  @Min(1, { message: 'Min usage is 1' })
  @IsNotEmpty({ message: 'Max usage is required' })
  maxUsage!: number;
}
