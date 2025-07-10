import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsMongoId,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter and one number',
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+?\d{10,15}$/, {
    message:
      'Phone must be a valid international number (10–15 digits, optional +)',
  })
  phone: string;

  @IsOptional()
  @IsBoolean({ message: 'isAdmin must be true or false' })
  isAdmin?: boolean;

  @IsOptional()
  @IsString({ message: 'Profile image URL must be a string' })
  profileImageUrl?: string;
}

export class findAllQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsString()
  search?: string;
}

export class mongoDBIdValidation {
  @IsMongoId({ message: 'Invalid MongoDB ID format' })
  id: string;
}

export class ChangePasswordDtoByOtp {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP cannot be empty' })
  otp: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'New password must contain at least one uppercase letter and one number',
  })
  newPassword: string;
}


export class UpdatePasswordDto{
  @IsString({ message: 'Old password must be a string' })
  @MinLength(6, { message: 'Old password must be at least 6 characters long' })
  currentPassword: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;

   @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  confirmNewPassword: string;
}