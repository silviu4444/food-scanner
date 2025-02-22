import { AuthGuard } from '@nestjs/passport';
import { StrategiesEnum } from '../constants/strategies.constants';

export class LocalAuthGuard extends AuthGuard(StrategiesEnum.LOCAL) {}
