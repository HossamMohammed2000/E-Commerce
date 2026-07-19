import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

import { multerOptions } from 'src/common/utils/multer.utils';
import { UpdateProductDto } from './dto/update-product.dto';
import { HttpCacheInterceptor } from 'src/cache/interceptors/cache.interceptor';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @UseInterceptors(HttpCacheInterceptor)
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file)
      throw new BadRequestException('a product image file is required');

    const imageUrl = `http://localhost:5000/uploads/${file.path.replace(/\\/g, '/')}`;
    const adminId = req.user.id;

    return (this.productsService as any).create(
      createProductDto,
      imageUrl,
      adminId,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = `http://localhost:5000/uploads/${file.path.replace(/\\/g, '/')}`;
    }

    return await this.productsService.update(id, updateProductDto, imageUrl);
  }
}
