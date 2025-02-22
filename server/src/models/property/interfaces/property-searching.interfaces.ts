import { CurrencyType } from '@/common/interfaces/currency.interfaces';
import { GeoCoordinatesDto } from './properties-search.interfaces';

export type DrawToSearchPin = {
  geoCoordinates: GeoCoordinatesDto;
  properties: { propertyId: string; price: CurrencyType }[];
};

export type DrawToSearchResponseDto = {
  pins: DrawToSearchPin[];
};
