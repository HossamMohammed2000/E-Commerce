import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, HBrandDocument } from 'src/DB/Models/brand.model';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Category, HCategoryDocument } from 'src/DB/Models/categeory.model';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<HBrandDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<HCategoryDocument>,
  ) {}

  private async validateCategoriesExist(categoryIds: string[]): Promise<void> {
    if (categoryIds && categoryIds.length === 0) return;

    const existingCategories = await this.categoryModel.countDocuments({
      _id: { $in: categoryIds },
    });

    if (existingCategories !== categoryIds.length) {
      throw new NotFoundException(
        'One or more assigned categories ids not exists in db',
      );
    }
  }

  async create(dto: CreateBrandDto, logoUrl: string, adminId: string) {
    await this.validateCategoriesExist(dto.categories);
    const brand = await this.brandModel.findOne({ name: dto.name });
    if (brand) {
      throw new ConflictException('Brand already exists');
    }
    const newBrand = new this.brandModel({
      ...dto,
      logo: logoUrl,
      createdBy: adminId,
    });

    return newBrand.save();
  }

  async update(dto: UpdateBrandDto, id: string, logoUrl?: string) {
    if (dto.categories) {
      await this.validateCategoriesExist(dto.categories);
    }
    const updatedPayload: Partial<UpdateBrandDto> & { logo?: string } = {
      ...dto,
    };
    if (logoUrl) {
      updatedPayload.logo = logoUrl;
    }
    const updated = await this.brandModel.findByIdAndUpdate(
      id,
      updatedPayload,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Brand not found');
    }
    return updated;
  }

  async findAll() {
    return this.brandModel
      .find()
      .populate('createdBy', 'firstName lastName email');
  }

  async findById(id: string) {
    const brand = await this.brandModel.findById(id).populate('createdBy');
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async delete(id: string) {
    const deleted = await this.brandModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Brand not found');
    }
    return deleted;
  }
}
