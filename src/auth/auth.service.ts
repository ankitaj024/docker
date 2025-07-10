import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  Email_And_Password_Required,
  Email_Or_Password_Incorrect,
  Login_Success,
  User_Not_Found,
} from 'src/utils/constants';
import { errorResponse, response } from 'src/utils/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  async loginUser(loginDto: LoginDto) {
    try {
      if (!loginDto.email || !loginDto.password) {
        throw new HttpException(
          Email_And_Password_Required,
          HttpStatus.BAD_REQUEST,
        );
      }

      const isUserFound = await this.prisma.users.findUnique({
        where: {
          email: loginDto.email,
        },
      });

      const isPasswordValid = await bcrypt.compareSync(
        loginDto.password,
        isUserFound?.password,
      );

      if (!isUserFound || !isPasswordValid) {
        throw new HttpException(
          Email_Or_Password_Incorrect,
          HttpStatus.NOT_FOUND,
        );
      }

      const token = await this.generateToken({
        id: isUserFound.id,
        isAdmin: isUserFound.isAdmin,
      });

      const refreshToken = await this.jwt.sign({ id: isUserFound.id, IsAdmin: isUserFound.isAdmin }, { expiresIn: '30d' })

      return response(Login_Success, HttpStatus.OK, {
        access_token: token,
        refresh_token: refreshToken,
        email: isUserFound.email,
        name: isUserFound.name,
        isAdmin: isUserFound.isAdmin,
      });
    } catch (error) {
      errorResponse(error);
    }
  }

  async generateToken(body) {
    return await this.jwt.sign(body);
  }

  create(createAuthDto: LoginDto) {
    return 'This action adds a new auth';
  }
}
