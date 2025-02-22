import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ModelsModule } from '@/models';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthenticationModule } from './authentication/authentication.module';
import { DtoInterceptor } from './common/interceptors/dto.interceptor';
import { MailerModule } from './providers/mailer/provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MailerModule,
    AuthenticationModule,
    ModelsModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DtoInterceptor
    }
  ]
})
export class AppModule {}
