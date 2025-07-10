import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { IsAdmin } from 'src/auth/admin.decorator';
import { UserService } from 'src/user/user.service';
import { findAllQuery } from 'src/user/dto/create-user.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {}

  //FIND ALL USERS
  @UseGuards(JwtAuthGuard)
  @IsAdmin()
  @Get('/users')
  findAllUsers(
    @Query(new ValidationPipe({ transform: true }))
    query: findAllQuery,
  ) {
    const { limit, page, search } = query;
    return this.userService.findAllUsers(limit, page, search);
  }
}
