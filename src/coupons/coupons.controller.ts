import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { CouponService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { HttpCacheInterceptor } from 'src/cache/interceptors/cache.interceptor';

@Controller('coupon')
@UseGuards(AuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  create(@Body() dto: CreateCouponDto, @Req() req: any) {
    const adminId = req.user._id;
    return this.couponService.create(dto, adminId);
  }
  @Post('/validate')
  validate(@Body('code') code: string, @Req() req: any) {
    const userId = req.user._id;
    return this.couponService.validateCoupon(code, userId);
  }

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  findAll() {
    return this.couponService.findAll();
  }

  @Patch(':id')
  
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }
}
