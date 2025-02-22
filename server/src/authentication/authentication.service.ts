import { COOKIE_NAMES } from '@/common/constants/cookie.constants';
import { Dto } from '@/common/interfaces/dto.interfaces';
import { EmailSenderService } from '@/mails/email-sender.service';
import { PrismaService } from '@/prisma.service';
import { FastifyReply } from 'fastify';

import { getCookieOptions } from '@/common/helpers/cookie.helpers';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { expiresTimeTokenMilliseconds } from './constants/auth.constants';
import {
  getEmailVerificationSubjectTitle,
  getEmailVerificationTemplate
} from './helpers/auth.helpers';
import {
  CreateUserDtoType,
  GoogleUser,
  UserDtoType,
  PopulatedUser,
  JwtUser,
  EmailVerificationCodePayload
} from './interfaces/auth.interfaces';

@Injectable()
export class AuthenticationService {
  constructor(
    private emailSenderService: EmailSenderService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private prismaService: PrismaService
  ) {}

  async signInWithGoogle(
    user: GoogleUser,
    res: FastifyReply
  ): Promise<{
    encodedUser: string;
  }> {
    if (!user) throw new BadRequestException('Unauthenticated');

    const existingUser = await this.findUserByEmail(user.email);

    if (!existingUser) return this.registerGoogleUser(res, user);

    const encodedUser = this.encodeUserDataAsJwt(existingUser);

    this.setJwtTokenToCookies(res, existingUser as PopulatedUser);

    return {
      encodedUser
    };
  }

  async validateLocalUser(
    username: string,
    password: string
  ): Promise<Omit<PopulatedUser, 'password'> | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: {
          email: username
        }
      },
      include: {
        email: true,
        role: true
      }
    });

    if (user && !user.password) {
      throw new HttpException(
        'Invalid login method, the user is registered by a third party!',
        HttpStatus.BAD_REQUEST
      );
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...rest } = user;
      return rest as PopulatedUser;
    }

    return null;
  }

  async loginLocalUser(user: PopulatedUser, res: FastifyReply) {
    if (user.email.emailVerificationCode) {
      throw new HttpException(
        'Email address not verified',
        HttpStatus.BAD_REQUEST
      );
    }

    const userDto = this.mapUserToDto(user);
    this.setJwtTokenToCookies(res, user);

    return userDto;
  }

  async registerLocalUser(
    createUserDto: Dto<CreateUserDtoType>
  ): Promise<{ message: string }> {
    const alreadyExists = await this.findUserByEmail(createUserDto.data.email);

    if (alreadyExists) {
      throw new HttpException('User already exists!', HttpStatus.BAD_REQUEST);
    }

    const password = await bcrypt.hash(createUserDto.data.password, 10);

    const emailVerificationCode = this.jwtService.sign(
      {
        email: createUserDto.data.email,
        language: createUserDto.data.language
      } satisfies EmailVerificationCodePayload,
      {
        secret: this.configService.get('MAIL_JWT_SECRET')
      }
    );

    try {
      await this.emailSenderService.sendConfirmationEmail({
        html: getEmailVerificationTemplate(
          `${this.configService.get('PUBLIC_URL')}api/auth/verify-email?code=${emailVerificationCode}`,
          createUserDto.data.language
        ),
        subject: getEmailVerificationSubjectTitle(createUserDto.data.language),
        to: createUserDto.data.email
      });
    } catch (error) {
      throw new HttpException(
        'Sending the verification email has failed!',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const roleId = await this.defaultUserRoleId();

    await this.prismaService.user.create({
      data: {
        email: {
          create: {
            email: createUserDto.data.email,
            emailVerificationCode
          }
        },
        first_name: createUserDto.data.firstName,
        last_name: createUserDto.data.lastName,
        password,
        user_role_id: roleId!
      }
    });

    return { message: 'Registered successfully!' };
  }

  async verifyEmail(code: string) {
    if (!code || typeof code !== 'string') {
      throw new HttpException('Invalid code type', HttpStatus.BAD_REQUEST);
    }

    const validCode = this.jwtService.verify(code);

    if (!validCode) {
      throw new HttpException(
        'Invalid confirmation code',
        HttpStatus.BAD_REQUEST
      );
    }

    const { email, language }: EmailVerificationCodePayload =
      this.jwtService.decode(code);

    const user = await this.prismaService.user.findFirst({
      where: {
        email: {
          email
        }
      },
      include: {
        email: true
      }
    });

    if (!user) {
      throw new HttpException(
        'No user with this email',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!user.email?.emailVerificationCode) {
      throw new HttpException(
        'This email has been already verified',
        HttpStatus.BAD_REQUEST
      );
    }

    const updatedUser = await this.prismaService.user.update({
      where: { user_id: user.user_id },
      data: {
        email: {
          update: {
            emailVerificationCode: null
          }
        }
      }
    });

    return { language };
  }

  setJwtTokenToCookies(res: FastifyReply, user: PopulatedUser) {
    const expirationDateInMilliseconds =
      new Date().getTime() + expiresTimeTokenMilliseconds;

    const jwtUser: JwtUser = {
      id: user.user_id,
      sub: {
        role: user.role.role
      }
    };

    res.cookie(
      COOKIE_NAMES.JWT,
      this.jwtService.sign(jwtUser),
      getCookieOptions({ expires: new Date(expirationDateInMilliseconds) })
    );
  }

  private async findUserByEmail(email: string): Promise<PopulatedUser | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: {
          email
        }
      },
      include: {
        email: true,
        role: true
      }
    });

    if (!user) return null;
    return user as PopulatedUser;
  }

  private async registerGoogleUser(res: FastifyReply, user: GoogleUser) {
    try {
      const roleId = await this.defaultUserRoleId();

      const newUser = (await this.prismaService.user.create({
        data: {
          email: {
            create: {
              email: user.email
            }
          },
          first_name: user.firstName, // TODO check this can be undefined
          last_name: user.lastName, // TODO check this can be undefined
          picture: user.picture,
          user_role_id: roleId!
        },
        include: {
          email: true,
          role: true
        }
      })) as PopulatedUser;

      const encodedUser = this.encodeUserDataAsJwt(newUser);

      this.setJwtTokenToCookies(res, newUser);

      return {
        encodedUser
      };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  private encodeUserDataAsJwt(user: PopulatedUser): string {
    return this.jwtService.sign(this.mapUserToDto(user));
  }

  private mapUserToDto(user: PopulatedUser): UserDtoType {
    return {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      picture: user.picture,
      created_at: user.created_at,
      updated_at: user.updated_at,
      role: user.role.role
    };
  }

  private async defaultUserRoleId(): Promise<string | null> {
    const role = await this.prismaService.userRole.findFirst({
      where: {
        role: 'USER'
      }
    });

    return role?.user_role_id || null;
  }
}
