import { Module } from '@nestjs/common';
import { CouponService } from './coupons.service';
import { CouponController } from './coupons.controller';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';

import { UserModel } from 'src/DB/Models/user.model';
import { CouponModel } from 'src/DB/Models/coupons.model';
import { CasheModule } from 'src/cache/cache.module';

@Module({
  imports: [UserModel, CouponModel, CasheModule],
  providers: [CouponService, TokenService, JwtService],
  controllers: [CouponController],
})
export class CouponsModule {}
