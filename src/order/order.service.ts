import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { HOrderDocument, Order } from 'src/DB/Models/order.model';
import { Model } from 'mongoose';
import { Cart, HCartDocument } from 'src/DB/Models/cart.model';
import { HProductDocument, Product } from 'src/DB/Models/products.model';
import { Coupon, HCouponDocument } from 'src/DB/Models/coupons.model';
import { CreateOrderDto } from './dto/create-order.dtp';
import { OrderStatus } from 'src/common/enums/order.enums';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<HOrderDocument>,

    @InjectModel(Cart.name)
    private readonly cartModel: Model<HCartDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<HProductDocument>,

    @InjectModel(Coupon.name)
    private readonly couponModel: Model<HCouponDocument>,
  ) {}

  async checkout(userId: string, dto: CreateOrderDto) {
    // 1- fetch users's cart
    const cart = await this.cartModel.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      throw new BadGatewayException(
        'Your checkout pipeline is broken:cart is currently empty',
      );
    }
    const orderItems: any[] = [];
    let calculatedSubTotal = 0;

    for (const item of cart.items) {
      const dbProduct = await this.productModel.findById(item.product);
      if (!dbProduct) {
        throw new NotFoundException(
          `Checkout aboted: ProductID${item.product} no longer exists`,
        );
      }
      if (dbProduct.stock < item.quantity) {
        throw new NotFoundException(
          `Insufficient stock for item ${dbProduct.name}. stored stock:${dbProduct.stock}, requested quantity:${item.quantity}`,
        );
      }
      calculatedSubTotal += Number(dbProduct.price) * item.quantity;
      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        priceSnapshot: dbProduct.price,
      });
      dbProduct.stock -= item.quantity;
      await dbProduct.save();
    }
    let discountAmount = 0;
    let targetCoupon: HCouponDocument | null = null;
    if (dto.couponCode) {
      targetCoupon = await this.couponModel.findOne({
        code: dto.couponCode.toLocaleUpperCase().trim(),
      });
      if (!targetCoupon) {
        throw new NotFoundException('This Coupon Code Does Not Exist');
      }
      if (new Date() > targetCoupon.expireDate) {
        throw new BadRequestException('This Coupon Code Has Expired');
      }
      if (targetCoupon.usedCount >= targetCoupon.maxUsage) {
        throw new NotFoundException('This Coupon Code Has Reached Its Limit');
      }
      if (targetCoupon.usedBy.map((id) => id.toString()).includes(userId)) {
        throw new BadRequestException('This Coupon Code Has Already Been Used');
      }
      if (targetCoupon.usedBy.map((id) => id.toString()).includes(userId)) {
        throw new BadRequestException('This Coupon Code Has Already Been Used');
      }
      discountAmount =
        (calculatedSubTotal * targetCoupon.discountPercentage) / 100;
    }

    const finalPrice = calculatedSubTotal - discountAmount;
    for (const item of orderItems) {
      await this.productModel.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }
    if (targetCoupon) {
      await this.couponModel.findByIdAndUpdate(targetCoupon._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: userId },
      });
    }
    const order = new this.orderModel({
      user: userId,
      items: orderItems,
      subTotal: calculatedSubTotal,
      discountAmount,
      finalPrice,
      shippingAddress: dto.shippingAddress,
      appliedCoupon: targetCoupon ? targetCoupon._id : null,
      status: OrderStatus.PENDING,
    });
    await order.save();
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
    return order;
  }

  findAll() {
    return `This action returns all order`;
  }
}
