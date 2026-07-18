import { HProductDocument, Product } from './../DB/Models/products.model';
// import { CartModel } from './../DB/Models/cart.model';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, HCartDocument } from 'src/DB/Models/cart.model';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<HCartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<HProductDocument>,
  ) {}
  private async recalculateTotalPrice(cart: HCartDocument) {
    let total = 0;
    for (const item of cart.items) {
      item.subTotal = item.quantity * item.pricePerUnit;
      total += item.subTotal;
    }
    cart.totalPrice = total;
    await cart.save();
  }
  async getCart(userId: string): Promise<any> {
    let cart = await this.cartModel
      .findOne({ user: userId })
      .populate('items.product');
    if (!cart) {
      cart = await this.cartModel.create({
        user: userId,
        items: [],
        totalPrice: 0,
      });
      await cart.save();
    }
    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const { productId, quantity } = dto;
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < quantity) {
      throw new BadRequestException(' Not enough stock available');
    }
    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      cart = await this.cartModel.create({
        user: userId,
        items: [],
        totalPrice: 0,
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (existingItemIndex > -1) {
      const targetNewQuantity =
        cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < targetNewQuantity) {
        throw new BadRequestException(' Not enough stock available');
      }
      cart.items[existingItemIndex].quantity = targetNewQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        pricePerUnit: product.price,
        subTotal: quantity * product.price,
      });
    }

    await this.recalculateTotalPrice(cart);

    return await (await cart.save()).populate('items.product');
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );
    await this.recalculateTotalPrice(cart);
    return await (await cart.save()).populate('items.product');
  }
}
