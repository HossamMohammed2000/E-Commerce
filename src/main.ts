import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilters } from './common/filters/all-exceptions.filters';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilters());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use('/upload', express.static(join(__dirname, '..', 'uploads')));

  const port = process.env.PORT ?? 5000;
  await app.listen(port);

  console.log(`Application is running http://127.0.0.1:${port}`);
}

bootstrap();
