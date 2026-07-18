import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendVerficationOtp(email: string, otp: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your Account Activation Code',
        template: './otp',
        context: {
          confirmEmailOtp: otp,
        },
      });

      this.logger.log(
        `Verfication Code Successfully Dispatched To : ${email}`,
      );
    } catch (error) {
      this.logger.error(`Failed To Send Email To : ${email}`, error);
    }
  }
}