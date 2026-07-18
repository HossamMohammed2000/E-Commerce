import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, HBrandDocument } from '../DB/Models/brand.model';
import { HProductDocument, Product } from 'src/DB/Models/products.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<HProductDocument>,

    @InjectModel(Brand.name)
    private readonly brandModel: Model<HBrandDocument>,
  ) {}

  private async validateBrandCategoryRelationShip(
    brandId: string | number,
    categoryId: string | number,
  ): Promise<boolean> {
    const brand = await this.brandModel.findById(brandId);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`);
    }
    const supportedcategoriesIds = brand.categories.map((category) =>
      category.toString(),
    );
    if (!supportedcategoriesIds.includes(categoryId.toString())) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    return brand && supportedcategoriesIds ? true : false;
  }

  async create(
    dto: CreateProductDto,
    imageUrl: string,
    adminId: string,
  ): Promise<HProductDocument> {
    const { brand, category } = dto;
    if (!brand || !category) {
      throw new BadRequestException('Brand and category are required');
    }
    await this.validateBrandCategoryRelationShip(dto.brand, dto.category);
    const newProduct = new this.productModel({
      ...dto,
      images: [imageUrl],
      createdBy: adminId,
    });
    return (await newProduct.save()).populate(
      'brand category createdBy',
      '-password',
    );
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    imageUrl?: string,
  ): Promise<HProductDocument | null> {
    const existingProduct = await this.productModel.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (dto.brand || dto.category) {
      await this.validateBrandCategoryRelationShip(
        dto.brand || existingProduct.brand,
        dto.category || existingProduct.category,
      );
    }
    const updatedPayloaded: any = { ...dto };
    if (imageUrl) {
      updatedPayloaded.images = [imageUrl];
    }
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updatedPayloaded,
      { new: true },
    );
    return updatedProduct
      ? updatedProduct.populate('brand category createdBy', '-password')
      : null;
  }

  async findAll(): Promise<HProductDocument[]> {
    return this.productModel
      .find()
      .populate('brand category createdBy', '-password');
  }

  async findById(id: string): Promise<HProductDocument[] | null | undefined> {
    const product = await this.productModel
      .find({ _id: id })
      .populate('brand category createdBy', '-password');
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
}
