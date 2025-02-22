import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthenticationService } from '../authentication.service';
import { StrategiesEnum } from '../constants/strategies.constants';
import {
  EMAIL_REGEX_VALIDATION,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH
} from '../constants/validators.constants';
import { LoginUserDtoType } from '../interfaces/auth.interfaces';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  StrategiesEnum.LOCAL
) {
  constructor(private authService: AuthenticationService) {
    super();
  }

  async validate(username: string, password: string) {
    const typedFields: LoginUserDtoType = { username, password };
    const invalidFields =
      !new RegExp(EMAIL_REGEX_VALIDATION).test(typedFields.username) ||
      typedFields.password.length < PASSWORD_MIN_LENGTH ||
      typedFields.password.length > PASSWORD_MAX_LENGTH;

    if (invalidFields) {
      throw new HttpException('Invalid fields!', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.authService.validateLocalUser(
        typedFields.username,
        typedFields.password
      );

      if (!user) {
        throw new HttpException(
          'Wrong email or password',
          HttpStatus.BAD_REQUEST
        );
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
