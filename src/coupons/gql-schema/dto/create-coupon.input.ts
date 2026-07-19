import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCouponDto {
  @IsString()
  @IsNotEmpty({ message: 'Coupon code is required' })
  @Field(() => String)
  code!: string;

  @IsInt()
  @IsNotEmpty({ message: 'Discount is required' })
  @Max(100, { message: 'Discount cannot exceed 100%.' })
  @Field(() => Int)
  discountPercentage!: number;

  @IsDateString({}, { message: 'Expiry Date must be a valid ISO date string' })
  @Field(() => String)
  expiryDate!: string;

  @IsInt()
  @Min(1, { message: 'Min usage is 1' })
  @IsNotEmpty({ message: 'Max usage is required' })
  @Field(() => Int)
  maxUsage!: number;
}
