import { Coupon } from 'src/DB/Models/coupons.model';
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HOrderDocument, Order } from 'src/DB/Models/order.model';
import { Model, Types } from 'mongoose';
import { Cart, HCartDocument } from 'src/DB/Models/cart.model';
import { OrderStatus } from 'src/common/enums/order.enums';
import { SocketService } from 'src/socket/socket.service';
import type { User } from 'src/DB/Models/user.model';
import { PaymentService } from 'src/common/services/payment/payment.service';
// import { Stripe } from 'stripe';
import Stripe from 'stripe';
import { paymentMethodEnum } from 'src/common/enums/user.enums';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<HOrderDocument>,

    @InjectModel(Cart.name)
    private readonly cartModel: Model<HCartDocument>,

    private readonly paymentService: PaymentService,

    private readonly socketService: SocketService,
  ) {}

  async create(cartId: string, address: string, phone: string, userId: string) {
    const cart = await this.cartModel.findById(cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const order = await this.orderModel.create({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product,
        qty: item.quantity,
        priceSnapshot: item.pricePerUnit,
      })),
      subTotal: cart.totalPrice,
      totalPrice: cart.totalPrice,
      shippingAddress: address,
      status: OrderStatus.PROCESSING,
    });

    return order;
  }

  async createCheckOutSession(orderId: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this.orderModel
      .findOne({
        _id: orderId,
        user: userId.toString(),
        status: OrderStatus.PROCESSING,
        paymentMethod: paymentMethodEnum.CARD,
      })
      .populate([{ path: 'user' }, { path: 'appliedCoupon' }]);

    if (!order) {
      throw new NotFoundException('order not found');
    }

    const amount = order.totalPrice;

    const user = order.user as unknown as User;

    const line_items = [
      {
        price_data: {
          currency: 'egp',
          product_data: {
            name: `Order ${user.firstName}`,
            description: `Payment for order on Address ${order.shippingAddress}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ];

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (order.discountAmount) {
      const coupon = await this.paymentService.createCoupon({
        duration: 'once',
        currency: 'egp',
        percent_off: order.discountAmount,
      });
      discounts.push({ coupon: coupon.id });
    }
    const session = await this.paymentService.checkoutSession({
      customer_email: user.email,
      line_items,
      mode: 'payment',
      discounts,
      metadata: {
        orderId: orderId.toString(),
      },
    });

    const method = await this.paymentService.createPaymentMethod({
      type: 'card',
      card: { token: 'token_visa' },
    });

    const intent = await this.paymentService.createPaymentIntent({
      amount: order.subTotal * 100,
      currency: 'egp',
      payment_method: method.id,
      payment_method_types: [paymentMethodEnum.CARD],
    });

    order.paymentIntentId = intent.id;
    await order.save();
    await this.paymentService.confirmPaymentIntent(intent.id);
    return session;
  }

  async refundOrder(orderId: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      user: userId.toString(),
      paymentMethod: paymentMethodEnum.CARD,
    });
    if (!order) throw new NotFoundException('order not found');
    if (!order.paymentIntentId)
      throw new BadGatewayException('No Payment Intent Found For This Order');
    const refund = await this.paymentService.createRefund(
      order.paymentIntentId,
    );
    await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        status: OrderStatus.CANCELLED,
        refundId: refund.id,
        refundedAt: new Date(),
        $unset: { paymentIntentId: true },
        $_inc: { __v: 1 },
      },
      { new: true },
    );
    return order;
  }
}
