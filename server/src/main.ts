import fastifyCookie from '@fastify/cookie';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', (request, reply, done) => {
      (reply as any).setHeader = function (key, value) {
        return this.raw.setHeader(key, value);
      };
      (reply as any).end = function () {
        this.raw.end();
      };
      (request as any).res = reply;
      done();
    });

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_TOKEN
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );
  app.setGlobalPrefix('/api');
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true
  });
  await app.listen(process.env.PORT ?? 8080, '0.0.0.0', () => {
    console.log('Nest Js Server running on port:', process.env.PORT);
  });
}
bootstrap();
