import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, HCategoryDocument } from '../DB/Models/categeory.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<HCategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto, logoUrl: string, adminId: string) {
    const category = await this.categoryModel.findOne({ name: dto.name });
    if (category) {
      throw new ConflictException('Category already exists');
    }
    const newCategory = new this.categoryModel({
      ...dto,
      logo: logoUrl,
      createdBy: adminId,
    });

    return newCategory.save();
  }

  async update(
    dto: UpdateCategoryDto,
    logoUrl: string | undefined,
    id: string,
  ) {
    const updatedPayload: Partial<UpdateCategoryDto> & { logo?: string } = {
      ...dto,
    };
    if (logoUrl) {
      updatedPayload.logo = logoUrl;
    }
    const updated = await this.categoryModel.findByIdAndUpdate(
      id,
      updatedPayload,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Category not found');
    }
    return updated;
  }

  async findAll() {
    return this.categoryModel
      .find()
      .populate('createdBy', 'firstName lastName email');
  }

  async findById(id: string) {
    const category = await this.categoryModel
      .findById(id)
      .populate('createdBy');
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async delete(id: string) {
    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Category not found');
    }
    return deleted;
  }
}
