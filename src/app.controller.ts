import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { AppService, type Cat } from './app.service';

import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  create(@Body() body: Cat) {
    this.appService.create(body);
  }

  @Get()
  
  findAll() {
    return this.appService.findAll();
  }

  @Get('port')
  getAppPort() {
    // Retrieve the variable using the .get() method
    const port = this.configService.get<number>('PORT');
    if(port!==10) throw  new BadRequestException('PORT must be 10');
    return { message: `Application is running on port ${port}` };
  }
}