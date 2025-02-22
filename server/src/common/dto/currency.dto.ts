import { CurrencyTypeEnum } from '@prisma/client';
import { IsEnum, IsNumber, Min } from 'class-validator';

export class CurrencyTypeDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(CurrencyTypeEnum)
  currency: CurrencyTypeEnum;
}
