import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ChangePasswordDtoByOtp,
  CreateUserDto,
  UpdatePasswordDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  Fill_All_Details_SignUp,
  User_Exists,
  User_Created,
  User_Founded,
  Provide_User_Id,
  User_Not_Found,
  User_Updated,
  User_Deleted,
  Email_Or_Password_Incorrect,
  Email_And_Password_Required,
  Login_Success,
  Token_Expires,
  Access_Denied,
  Otp_Sent_To_Email,
  Password_Changed,
  Otp_Invalid_Or_Expired,
  Current_Password_Incorrect,
  Password_Updated,
  New_Confirm_Password_Not_Match,
} from 'src/utils/constants';
import { errorResponse, generateOTP, response } from 'src/utils/common';
import { EmailService } from 'src/email/email.service';
import { join } from 'path';
import { existsSync, rmSync } from 'fs';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: EmailService,
  ) { }

  // CREATE USER
  async createUser(createUserDto: CreateUserDto) {
    try {
      if (!createUserDto) {
        throw new HttpException(Fill_All_Details_SignUp, HttpStatus.BAD_REQUEST);
      }

      const userPresent = await this.prisma.users.findUnique({
        where: {
          email: createUserDto.email,
        },
      });

      if (userPresent) {
        throw new HttpException(User_Exists, HttpStatus.BAD_REQUEST);
      }

      const hash = await bcrypt.hash(createUserDto.password || '', 10);
      createUserDto.password = hash;

      const user = await this.prisma.users.create({
        data: createUserDto,
      });

      this.mailService.sendWelcomeEmail(user);
      return response(User_Created, HttpStatus.CREATED, user);
    } catch (error) {
      errorResponse(error);
    }
  }

  // GET ALL USERS
  async findAllUsers(limit: number, page: number, search: string) {
    try {
      const whereClause: any = {};

      if (search?.length) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const totalUsers = await this.prisma.users.count({ where: whereClause });
      const users = await this.prisma.users.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      });

      const totalPages = Math.ceil(totalUsers / limit);

      return response(User_Founded, HttpStatus.OK, {
        total: totalUsers,
        totalPages,
        currentPage: page,
        users,
      });
    } catch (error) {
      errorResponse(error);
    }
  }

  // FIND USER BY ID
  async findUserById(id: string) {
    try {
      if (!id) {
        throw new HttpException(Provide_User_Id, HttpStatus.BAD_REQUEST);
      }

      const user = await this.prisma.users.findUnique({ where: { id } });

      if (!user) {
        throw new HttpException(User_Not_Found, HttpStatus.NOT_FOUND);
      }

      return response(User_Founded, HttpStatus.OK, user);
    } catch (error) {
      errorResponse(error);
    }
  }

  // UPDATE USER BY ID
  async updateUserById(userId: string, updateUserDto: UpdateUserDto) {
    try {
      if (!userId) {
        throw new HttpException(Provide_User_Id, HttpStatus.BAD_REQUEST);
      }

      const user = await this.prisma.users.findUnique({ where: { id: userId } });

      if (!user) {
        throw new HttpException(User_Not_Found, HttpStatus.NOT_FOUND);
      }

      const updatedUser = await this.prisma.users.update({
        where: { id: userId },
        data: updateUserDto,
      });

      return response(User_Updated, HttpStatus.OK, updatedUser);
    } catch (error) {
      errorResponse(error);
    }
  }

  // DELETE USER BY ID
  async deleteUserById(id: string) {
    try {
      if (!id) {
        throw new HttpException(Provide_User_Id, HttpStatus.BAD_REQUEST);
      }

      const user = await this.prisma.users.findUnique({ where: { id } });

      if (!user) {
        throw new HttpException(User_Not_Found, HttpStatus.NOT_FOUND);
      }


      await this.prisma.users.delete({ where: { id } });


      const folderPath = join(process.cwd(), 'uploads', 'users', id);


      if (existsSync(folderPath)) {
        rmSync(folderPath, { recursive: true, force: true });
      }

      return response(User_Deleted, HttpStatus.OK, user);
    } catch (error) {
      errorResponse(error);
    }
  }

  // FORGET PASSWORD
  async forgetPassword(email: string) {
    try {
      const user = await this.prisma.users.findUnique({ where: { email } });

      if (!user) {
        throw new HttpException(User_Not_Found, HttpStatus.NOT_FOUND);
      }

      const otpGenerated = generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      const otp = `${otpGenerated}`;

      await this.prisma.users.update({
        where: { email },
        data: {
          otp,
          expiresIn: otpExpiry,
        },
      });

      this.mailService.sendOtp(user, otp);
      return response(Otp_Sent_To_Email, HttpStatus.OK, { email: user.email });
    } catch (error) {
      errorResponse(error);
    }
  }

  // CHANGE PASSWORD BY OTP
  async changePasswordByOtp(changePasswordDtoByOtp: ChangePasswordDtoByOtp) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { email: changePasswordDtoByOtp.email },
      });

      if (!user) {
        throw new HttpException(User_Not_Found, HttpStatus.NOT_FOUND);
      }

      if (
        user.otp !== changePasswordDtoByOtp.otp ||
        new Date() > user.expiresIn
      ) {
        throw new HttpException(Otp_Invalid_Or_Expired, HttpStatus.BAD_REQUEST);
      }

      const hash = await bcrypt.hash(changePasswordDtoByOtp.newPassword, 10);

      await this.prisma.users.update({
        where: { email: changePasswordDtoByOtp.email },
        data: {
          password: hash,
          otp: null,
          expiresIn: null,
        },
      });

      this.mailService.sendPasswordChangeConfirmation(user);
      return response(Password_Changed, HttpStatus.OK, { email: user.email });
    } catch (error) {
      errorResponse(error);
    }
  }

  // UPDATE PASSWORD
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id: userId } });

      if (!user) {
        throw new HttpException(User_Not_Found, HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await bcrypt.compareSync(
        updatePasswordDto.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new HttpException(Current_Password_Incorrect, HttpStatus.BAD_REQUEST);
      }

      if (
        updatePasswordDto.newPassword !== updatePasswordDto.confirmNewPassword ||
        !updatePasswordDto.newPassword ||
        !updatePasswordDto.confirmNewPassword
      ) {
        throw new HttpException(New_Confirm_Password_Not_Match, HttpStatus.BAD_REQUEST);
      }

      const hash = await bcrypt.hash(updatePasswordDto.newPassword, 10);

      await this.prisma.users.update({
        where: { id: userId },
        data: {
          password: hash,
        },
      });

      return response(Password_Updated, HttpStatus.OK, { email: user.email });
    } catch (error) {
      errorResponse(error);
    }
  }
}
