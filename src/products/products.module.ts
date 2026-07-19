import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

import { ProductModel } from 'src/DB/Models/products.model';
import { BrandModel } from 'src/DB/Models/brand.model';
import { UserModel } from 'src/DB/Models/user.model';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { CategoryModel } from 'src/DB/Models/categeory.model';
import { CasheModule } from 'src/cache/cache.module';

@Module({
  imports: [ProductModel, BrandModel, CategoryModel, UserModel, CasheModule],
  controllers: [ProductsController],
  providers: [ProductsService, TokenService, JwtService],
})
export class ProductsModule {}
