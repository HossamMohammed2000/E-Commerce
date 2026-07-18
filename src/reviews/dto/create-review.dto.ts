import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  @Length(24, 24)
  product!: string;

  @IsNumber()
  @IsInt({ message: 'Rating must be an integer' })
  @IsNotEmpty({ message: 'Rating is required' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Type(() => Number)
  rating!: number;

  @IsString()
  @IsNotEmpty({ message: 'Review cannot be empty' })
  @Length(10, 500, { message: 'Review must be between 10 and 500 characters' })
  @Transform(({ value }) => value?.trim())
  comment!: string;
}
