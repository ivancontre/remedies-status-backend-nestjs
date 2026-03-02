import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.enableCors({ origin: true, credentials: true });

  const cfg = app.get(ConfigService);
  const port = Number(cfg.get<string>('APP_PORT', '3000'));

  await app.listen(port);
}
bootstrap();