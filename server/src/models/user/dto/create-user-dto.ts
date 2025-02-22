import {
  EMAIL_MAX_LENGTH,
  EMAIL_REGEX_VALIDATION,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH
} from '@/authentication/constants/validators.constants';
import { CreateUserDtoType } from '@/authentication/interfaces/auth.interfaces';
import { Dto } from '@/common/interfaces/dto.interfaces';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';
import { i18nSupported } from 'src/common/constants/i18n.constants';

class CreateUser {
  @IsString()
  @MinLength(NAME_MIN_LENGTH)
  @MaxLength(NAME_MAX_LENGTH)
  firstName: string;

  @IsString()
  @MinLength(NAME_MIN_LENGTH)
  @MaxLength(NAME_MAX_LENGTH)
  lastName: string;

  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  @Matches(EMAIL_REGEX_VALIDATION)
  email: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;

  @IsEnum(i18nSupported, { message: 'Unsupported language!' })
  language: i18nSupported;
}

export class CreateUserDto implements Dto<CreateUserDtoType> {
  @ValidateNested()
  @Type(() => CreateUser)
  data: CreateUser;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
