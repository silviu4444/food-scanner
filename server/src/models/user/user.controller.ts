import { JwtGuard } from '@/authentication/guards/jwt-auth.guard';
import { RequestWithJwtUser } from '@/authentication/interfaces/auth.interfaces';
import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user-properties')
  async getPropertiesByUser(
    @Req() req: RequestWithJwtUser,
    @Query('page', new ParseIntPipe()) page: number
  ) {
    return this.userService.getUserProperties({
      userId: req.user.id,
      page: page
    });
  }
}
