import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: any) {
    const userId = req.user._id;
    return await this.cartService.getCart(userId);
  }

  @Post('add')
  async addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = req.user._id;
    return await this.cartService.addToCart(userId, dto);
  }

  @Patch('item/:productId')
  async removeItem(@Req() req: any, @Param('productId') productId: string) {
    const userId = req.user._id;
    return await this.cartService.removeItem(userId, productId);
  }
}
