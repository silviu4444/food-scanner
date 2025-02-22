import { CurrencyTypeEnum } from "@prisma/client";

export type CurrencyType = {
  amount: number;
  currency: CurrencyTypeEnum;
};
