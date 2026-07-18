import { Injectable } from '@nestjs/common';

export type Cat = {
  name: string;
  age: number;
  breed: string;
};

@Injectable()
export class AppService {
  private cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
    return cat;
  }

  findAll() {
    return this.cats;
  }
}