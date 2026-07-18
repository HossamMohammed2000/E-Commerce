import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':productId')
  @UseGuards(AuthGuard)
  async findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateReviewDto, @Req() req: any) {
    const userId = req.user._id;
    return this.reviewsService.create(dto, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Body() updateReviewDto: UpdateReviewDto,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = req.user._id;
    return this.reviewsService.update(id, updateReviewDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;
    const review = await this.reviewsService.delete(id, userId);
    if (!review) {
      throw new NotFoundException(
        'Review not found or you are not allowed to delete this review',
      );
    }
    return review;
  }
}
