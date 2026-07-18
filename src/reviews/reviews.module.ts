import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { ProductModel } from 'src/DB/Models/products.model';
import { ReviewsModel } from 'src/DB/Models/review.model';
import { UserModel } from 'src/DB/Models/user.model';

@Module({
  imports: [ProductModel, ReviewsModel, UserModel],
  providers: [ReviewsService, TokenService, JwtService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
