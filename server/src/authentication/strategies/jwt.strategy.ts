import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { COOKIE_NAMES } from '@/common/constants/cookie.constants';
import { StrategiesEnum } from '../constants/strategies.constants';
import { JwtUser } from '../interfaces/auth.interfaces';

export class JwtStrategy extends PassportStrategy(
  Strategy,
  StrategiesEnum.JWT
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.[COOKIE_NAMES.JWT] || null // extract the cookies from the request
      ]),
      ignoreExpiration: false, // if the cookie is expired, an exception will be thrown
      secretOrKey: process.env.JWT_SECRET // the JWT Secret that will be used to check the integrity and authenticity of the token
    });
  }

  async validate(payload: JwtUser) {
    return payload; // any other validation on the payload if needed
  }
}
