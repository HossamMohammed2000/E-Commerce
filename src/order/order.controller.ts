import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dtp';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Controller('order')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    const userId = req.user._id;
    return this.orderService.checkout(userId, dto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }
}
