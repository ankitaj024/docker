import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChangePasswordDtoByOtp,
  CreateUserDto,
  findAllQuery,
  mongoDBIdValidation,
  UpdatePasswordDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { RequestWithUser } from 'src/utils/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  //CREATE USER
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  //FIND USER BY ID
  @Get(':id')
  findUserById(
    @Param(new ValidationPipe({ transform: true }))
    params: mongoDBIdValidation,
  ) {
    return this.userService.findUserById(params.id);
  }

  //UPDATE USER BY ID
  @UseGuards(JwtAuthGuard)
  @Patch()
  update(
    @Req() request: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = request.user?.userId;
    return this.userService.updateUserById(userId, updateUserDto);
  }

  //DELETE USER BY ID
  @Delete(':id')
  deleteUser(
    @Param(new ValidationPipe({ transform: true }))
    params: mongoDBIdValidation,
  ) {
    return this.userService.deleteUserById(params.id);
  }

  //FORGET PASSWORD
  @Post('forget-password')
  forgetPassword(
    @Body(new ValidationPipe({ transform: true }))
    body: {
      email: string;
    },
  ) {
    return this.userService.forgetPassword(body.email);
  }

  //CHANGE PASSWORD
  @Post('change-password')
  changePassword(@Body() changePasswordDtoByOtp: ChangePasswordDtoByOtp) {
    return this.userService.changePasswordByOtp(changePasswordDtoByOtp);
  }

  //UPDATE PASSWORD
  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  updatePassword(
    @Req() request: RequestWithUser,
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    const userId = request.user?.userId;
    return this.userService.updatePassword(userId, updatePasswordDto);
  }
} 
