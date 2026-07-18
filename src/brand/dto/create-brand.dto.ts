// import { Transform } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';


export class CreateBrandDto {
  @IsString()
  @IsNotEmpty({ message: 'Brand name is required..' })
  @Length(2, 50, {
    message: 'Brand Name must be between 2 and 50 character long',
  })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Brand logo is required..' })
  logo!: string;
  @IsArray({ message: 'categories must be an array' })
  @IsMongoId({
    each: true,
    message: 'Each category must be a valid MongoDB ObjectId',
  })
  //   @Transform(({ value }) => {
  //   if (typeof value === 'string') {
  //     try {
  //       return JSON.parse(value);
  //     } catch {
  //       return value;
  //     }
  //   }

  //   return value;
  // })
  categories!: string[];
}
