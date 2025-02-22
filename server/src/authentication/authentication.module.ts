import { EmailSenderService } from '@/mails/email-sender.service';
import { PrismaService } from '@/prisma.service';
import { JWTModule } from '@/providers/jwt/provider.module';
import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local-strategy';

@Module({
  imports: [JWTModule],
  controllers: [AuthenticationController],
  providers: [
    PrismaService,
    AuthenticationService,
    GoogleStrategy,
    JwtStrategy,
    LocalStrategy,
    EmailSenderService
  ]
})
export class AuthenticationModule {}
