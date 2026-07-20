import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dtp';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Types } from 'mongoose';
import { User } from 'src/DB/Models/user.model';

@Controller('api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body()
    body: { cartId: string; address: string; phone: string },
    @Req() req,
  ) {
    const userId = req.user._id;
    const { cartId, address, phone } = body;

    return this.orderService.create(cartId, address, phone, userId);
  }

  @Post('checkout/:orderId')
  @UseGuards(AuthGuard)
  async createCheckOutSession(
    @Param('orderId') orderId: Types.ObjectId,
    @Req() req,
  ) {
    const userId = req.user._id;
    const session = await this.orderService.createCheckOutSession(
      orderId,
      userId,
    );
    return session;
  }

  @Post('refund/:orderId')
  @UseGuards(AuthGuard)
  async refundOrder(@Param('orderId') orderId: Types.ObjectId, @Req() req) {
    const userId = req.user._id;
    const refund = await this.orderService.refundOrder(orderId, userId);
    return refund;
  }
}
