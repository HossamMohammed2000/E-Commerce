import { Transform, Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required.' })
  @Length(2, 100, {
    message: 'Product name must be between 2 and 100 characters.',
  })
  @Transform(({ value }) => value?.trim())
  name!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Product price is required.' })
  @Min(0, { message: 'Product price must be a positive number.' })
  @Type(() => Number)
  price!: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Product stock is required.' })
  @Min(0, { message: 'Product stock must be a positive number.' })
  @Type(() => Number)
  stock!: number;

  @IsMongoId({
    message: 'Product categoryId must be a valid MongoDB ObjectId.',
  })
  @IsNotEmpty({ message: 'Product categoryId is required.' })
  brand!: number;

  @IsMongoId({
    message: 'Product categoryId must be a valid MongoDB ObjectId.',
  })
  @IsNotEmpty({ message: 'Product categoryId is required.' })
  category!: number;
}
