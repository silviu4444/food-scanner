import { COOKIE_NAMES } from '@/common/constants/cookie.constants';
import { i18nSupported } from '@/common/constants/i18n.constants';
import { getCookieOptions } from '@/common/helpers/cookie.helpers';
import { CreateUserDto } from '@/models/user/dto/create-user-dto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Request,
  Res,
  Response,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticationService } from './authentication.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { LocalAuthGuard } from './guards/local-auth-guard';
import { RequestWithUser } from './interfaces/auth.interfaces';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(GoogleOAuthGuard)
  @Get('google')
  async googleAuth(@Req() req) {}

  @UseGuards(GoogleOAuthGuard)
  @Get('google-auth-redirect')
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { encodedUser } = await this.authenticationService.signInWithGoogle(
      req.user,
      res
    );
    return res
      .status(HttpStatus.MOVED_PERMANENTLY)
      .redirect(
        `${process.env.GOOGLE_REDIRECT_URL_CLIENT}?jwtUser=${encodedUser}`
      );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: RequestWithUser,
    @Response({ passthrough: true }) res: FastifyReply
  ) {
    const userData = await this.authenticationService.loginLocalUser(
      req.user,
      res
    );
    res.status(200);
    return userData;
  }

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authenticationService.registerLocalUser(createUserDto);
  }

  @Get('verify-email')
  async verifyEmail(@Res() res, @Query('code') codeVerification: string) {
    try {
      const result =
        await this.authenticationService.verifyEmail(codeVerification);
      res
        .status(HttpStatus.MOVED_PERMANENTLY)
        .redirect(
          `${process.env.CLIENT_URL}${result.language}/oauth/email-verified-successfully`
        );
    } catch (error) {
      Logger.warn(`Email verification error: ${error}`);
      res
        .status(HttpStatus.MOVED_PERMANENTLY)
        .redirect(
          `${process.env.CLIENT_URL}/oauth/email-verified-unsuccessfully`
        );
    }
  }

  @Get('logout')
  async logout(@Response() res: FastifyReply) {
    res.setCookie(
      COOKIE_NAMES.JWT,
      '',
      getCookieOptions({ expires: new Date(0) })
    );
    throw new UnauthorizedException('Successfully logged out!');
  }
}
