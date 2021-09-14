import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('App');

  const app = await NestFactory.create(AppModule);
  const port = +process.env.PORT;
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,PUT,POST,DELETE',
    credentials: true, // Set to true to pass the header, otherwise it is omitted.
  });

  if (process.env.NODE_ENV === 'development')
    logger.log(`App started at http://localhost:${port}`);
  await app.listen(port);
}
bootstrap();
