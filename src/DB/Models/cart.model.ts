import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Brand } from './brand.model';

@Schema({
  timestamps: true,
})
export class Cart {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
  })
  logo!: string;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
  ])
  categories!: Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  })
  createdBy!: string;
}

export const brandSchema = SchemaFactory.createForClass(Brand);

export type HBrandDocument = HydratedDocument<Brand>;

export const BrandModel = MongooseModule.forFeature([
  {
    name: Brand.name,
    schema: brandSchema,
  },
]);
