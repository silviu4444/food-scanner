import { i18nSupported } from '@/common/constants/i18n.constants';
import { Email, User, UserRole, UserRoleEnum } from '@prisma/client';
import { FastifyRequest } from 'fastify';

export type CreateUserDtoType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  language: i18nSupported;
};

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}

export interface JwtUser {
  id: string;
  sub: {
    role: UserRoleEnum;
  };
}

export type LoginUserDtoType = {
  username: string;
  password: string;
};

export type PopulatedUser = User & { email: Email; role: UserRole };

export type RequestWithUser = FastifyRequest & {
  user: PopulatedUser;
};

export type RequestWithJwtUser = FastifyRequest & {
  user: JwtUser;
};

export type UserDtoType = Omit<
  User,
  'password' | 'userId' | 'email' | 'updatedAt' | 'user_role_id'
> & { role: UserRoleEnum };

export type EmailVerificationCodePayload = {
  email: string;
  language: i18nSupported;
};
