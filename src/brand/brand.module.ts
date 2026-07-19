import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/services/token.service';
import { UserModel } from 'src/DB/Models/user.model';

import { BrandModel } from 'src/DB/Models/brand.model';
import { CategoryModel } from 'src/DB/Models/categeory.model';
import { CasheModule } from 'src/cache/cache.module';

@Module({
  imports: [UserModel, CategoryModel, BrandModel, CasheModule],
  providers: [BrandService, JwtService, TokenService],
  controllers: [BrandController],
})
export class BrandModule {}
