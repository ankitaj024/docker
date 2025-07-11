import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function readSecret(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (err) {
    console.warn(`Secret file not found: ${filePath}`);
    return '';
  }
}

// Load all secrets safely
process.env.JWT_SECRET =
  readSecret(process.env.JWT_SECRET_FILE ?? '') || process.env.JWT_SECRET;

process.env.DATABASE_URL =
  readSecret(process.env.DATABASE_URL_FILE ?? '') || process.env.DATABASE_URL;

process.env.EMAIL_PASSWORD =
  readSecret(process.env.EMAIL_PASSWORD_FILE ?? '') || process.env.EMAIL_PASSWORD;

process.env.EMAIL_USER =
  readSecret(process.env.EMAIL_USER_FILE ?? '') || process.env.EMAIL_USER;

process.env.EMAIL_HOST =
  readSecret(process.env.EMAIL_HOST_FILE ?? '') || process.env.EMAIL_HOST;

process.env.EMAIL_PORT =
  readSecret(process.env.EMAIL_PORT_FILE ?? '') || process.env.EMAIL_PORT;

process.env.STRIPE_SECRET_KEY =
  readSecret(process.env.STRIPE_SECRET_KEY_FILE ?? '') || process.env.STRIPE_SECRET_KEY;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 8500;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
