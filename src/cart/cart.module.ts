import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

import { CartModel } from 'src/DB/Models/cart.model';
import { ProductModel } from 'src/DB/Models/products.model';
import { UserModel } from 'src/DB/Models/user.model';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [CartModel, ProductModel, UserModel],
  controllers: [CartController],
  providers: [CartService, TokenService, JwtService],
})
export class CartModule {}
