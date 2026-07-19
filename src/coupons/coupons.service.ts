import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon, HCouponDocument } from 'src/DB/Models/coupons.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<HCouponDocument>,
  ) {}
  async create(dto: CreateCouponDto, adminId: string) {
    const cleanCode = dto.code.toUpperCase().trim();
    const existing = await this.couponModel.findOne({ code: cleanCode });
    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }
    const newCoupon = await this.couponModel.create({
      ...dto,
      code: cleanCode,
      createdBy: adminId,
    });
    return newCoupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    const updated = await this.couponModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) {
      throw new NotFoundException('Coupon not found');
    }
    return updated;
  }

  async findAll() {
    return this.couponModel
      .find()
      .populate('createdBy', 'firstName lastName email');
  }

  async validateCoupon(code: string, userId: string) {
    const coupon = await this.couponModel.findOne({
      code: code.toUpperCase().trim(),
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    if (new Date() > coupon.expireDate)
      throw new BadRequestException('This Coupon Code Has Expired');
    if (coupon.usedCount >= coupon.maxUsage) {
      throw new BadRequestException('This Coupon Code Has Reached Its Limit');
    }
    const hasUsed = coupon.usedBy.map((id) => id.toString()).includes(userId);
    if (hasUsed) {
      throw new BadRequestException('This Coupon Code Has Already Been Used');
    }
    return coupon;
  }
}
