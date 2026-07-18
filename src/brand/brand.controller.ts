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
import type { Request } from 'express';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandService } from './brand.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/utils/multer.utils';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  @Get()
  async findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.brandService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createBrandDto: CreateBrandDto,
    @Req() req: AuthRequest,
  ) {
    if (!file) {
      throw new BadRequestException('a brand logo image file is required');
    }
    const logoUrl = `http://localhost:5000/uploads/${file.path.replace(/\\/g, '/')}`;
    const adminId = req.user.id;
    return this.brandService.create(createBrandDto, logoUrl, adminId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    let logoUrl: string | undefined;
    if (file) {
      logoUrl = `http://localhost:5000/uploads/${file.path.replace(/\\/g, '/')}`;
    }
    return this.brandService.update(updateBrandDto, id, logoUrl);
  }

  @Patch(':id/delete')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    return this.brandService.delete(id);
  }
}
