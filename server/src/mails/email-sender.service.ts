import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

type SendConfirmationEmailDto = {
  to: string;
  subject: string;
  html: string;
};

@Injectable()
export class EmailSenderService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(dto: SendConfirmationEmailDto) {
    try {
      const result = await this.mailerService.sendMail(dto);

      return result;
    } catch (error) {
      Logger.error(`Email verification sending error: ${error}`);
    }
  }
}
