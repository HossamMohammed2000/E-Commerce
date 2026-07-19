import { CouponService } from '../coupons.service';
import { Coupon } from './coupon.schema';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateCouponDto } from './dto/create-coupon.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Resolver(() => Coupon)
export class CouponResolver {
  constructor(private readonly couponService: CouponService) {}
  @Query(() => [Coupon], { name: 'getCoupons' })
  async findAll() {
    return this.couponService.findAll();
  }

  @Mutation(() => Coupon, { name: 'createCoupon' })
  @UseGuards(AuthGuard)
  async createCoupon(
    @Args('input') input: CreateCouponDto,
    @Context() context: any,
  ) {
    const adminId = context.req.user._id;
    return this.couponService.create(input, adminId);
  }
}
