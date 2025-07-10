import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports:[UserModule,AuthModule],
  controllers: [AdminController],
  providers: [AdminService, UserService, EmailService],
})
export class AdminModule {}
