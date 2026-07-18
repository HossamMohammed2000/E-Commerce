import { HProductDocument } from './../DB/Models/products.model';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/DB/Models/products.model';
import { HReviewDocument, Review } from 'src/DB/Models/review.model';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<HReviewDocument>,
    @InjectModel(Product.name)
    private readonly ProductModel: Model<HProductDocument>,
  ) {}

  async create(dto: CreateReviewDto, userId: string) {
    const productExists = await this.ProductModel.exists({
      _id: dto.product,
    });
    if (!productExists) {
      throw new NotFoundException('Product not found');
    }
    const alreadyReviewed = await this.reviewModel.exists({
      product: dto.product,
      user: userId,
    });
    if (alreadyReviewed) {
      throw new ConflictException('Product already reviewed');
    }

    const newReview = new this.reviewModel({ ...dto, user: userId });
    return (await newReview.save()).populate(
      'user',
      'firstName lastName email',
    );
  }

  async update(reviewId: string, dto: UpdateReviewDto, userId: string) {
    const review = await this.reviewModel.findOne({
      _id: reviewId,
      user: userId,
    });
    if (!review) {
      throw new NotFoundException(
        'Review not found or you are not allowed to update this review',
      );
    }
    if (dto.rating) review.rating = dto.rating;
    if (dto.comment) review.comment = dto.comment;

    return (await review.save()).populate('user', 'firstName lastName email');
  }

  async findByProduct(productId: string) {
    return this.reviewModel
      .find({ product: productId })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async delete(reviewId: string, userId: string) {
    const results = await this.reviewModel.deleteOne({
      _id: reviewId,
      user: userId,
    });
    if (results.deletedCount === 0) {
      throw new NotFoundException(
        'Review not found or you are not allowed to delete this review',
      );
    }
    return { message: 'Review deleted successfully' };
  }
}
