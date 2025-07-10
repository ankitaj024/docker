import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) { }

  async sendWelcomeEmail(user: any) {
    const { email, name } = user
    return this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to KeymouseIt 🎉',
      template: 'welcome',
      context: {
        name
      },
    });
  }

  async sendOtp(user: any, otp: string) {
    const { email, name } = user
    return this.mailerService.sendMail({
      to: email,
      subject: 'Your OTP Code for KeymouseIt',
      template: 'otp-verification',
      context: {
        name,
        otp,
      },
    });
  }

  async sendPasswordChangeConfirmation(user: any) {
    const { email, name } = user
    return this.mailerService
      .sendMail({
        to: email,
        subject: '🔒 Your Password Was Successfully Changed',
        template: 'password-success',
        context: {
          name,
        },
      })
      .then(() => true)
      .catch((err) => {
        console.error('Failed to send password change email:', err);
        return false;
      });
  }
}
