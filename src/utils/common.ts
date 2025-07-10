import { HttpException } from '@nestjs/common';
import { Request } from 'express';

export const response = (message, status, data) => {
  const response = {
    message,
    status,
    data,
  };
  return response;
};

export const errorResponse = (error) => {
  const { message, status } = error;
  throw new HttpException(message, status);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    isAdmin?: boolean;
  };
}

