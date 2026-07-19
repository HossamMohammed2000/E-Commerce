import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { UserModel } from 'src/DB/Models/user.model';
import { ProductModel } from 'src/DB/Models/products.model';
import { CartModel } from 'src/DB/Models/cart.model';
import { CouponModel } from 'src/DB/Models/coupons.model';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { OrderModel } from 'src/DB/Models/order.model';

@Module({
  imports: [OrderModel, UserModel, ProductModel, CartModel, CouponModel],
  providers: [OrderService, TokenService, JwtService],
  controllers: [OrderController],
})
export class OrderModule {}
