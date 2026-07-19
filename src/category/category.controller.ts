import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request as Req,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from 'src/common/guard/auth.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/utils/multer.utils';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { HttpCacheInterceptor } from 'src/cache/interceptors/cache.interceptor';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @UseInterceptors(HttpCacheInterceptor)
  async findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('a category logo image file is required');
    }
    const logoUrl = `http://localhost:5000/uploads/${file.path.replace(/\\/g, '/')}`;
    const adminId = req.user.id;
    return this.categoryService.create(createCategoryDto, logoUrl, adminId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    let logoUrl: string | undefined;
    if (file) {
      logoUrl = `http://localhost:5000/uploads/${file.path.replace(/\\/g, '/')}`;
    }
    return this.categoryService.update(updateCategoryDto, logoUrl, id);
  }

  @Patch(':id/delete')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
