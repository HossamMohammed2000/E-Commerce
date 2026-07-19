import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

import { UserModel } from 'src/DB/Models/user.model';

import { CategoryModel } from 'src/DB/Models/categeory.model';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CasheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    CategoryModel,
    UserModel,
    CasheModule,
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
    }),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, AuthGuard],
})
export class CategoryModule {}
