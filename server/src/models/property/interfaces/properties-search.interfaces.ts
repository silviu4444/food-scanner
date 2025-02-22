import { CurrencyType } from '@/common/interfaces/currency.interfaces';
import { Dto, DtoWithPagination } from '@/common/interfaces/dto.interfaces';
import { PropertyAddressDto, PropertyPhotoDto } from '@/common/interfaces/property.interfaces';
import {
  ContactPreferenceEnum,
  PropertyConditionEnum,
  PropertyTypeEnum,
  RelationTypeEnum
} from '@prisma/client';

export type GeoCoordinatesDto = {
  latitude: number;
  longitude: number;
};

export type DrawToSearchPropertiesDto = Dto<{
  relationType: RelationTypeEnum;
  propertyType: PropertyTypeEnum;
  geoCoordinates: GeoCoordinatesDto[];
}>;

export type PropertyPreviewDto = {
  propertyId: string;
  property: {
    propertyCondition: PropertyConditionEnum;
    address: PropertyAddressDto;
    surface: number;
    roomNumber: number;
    bathroomNumber: number;
  };
  price: CurrencyType;
  contactPreference: ContactPreferenceEnum;
  photos: PropertyPhotoDto[];
};

export type PreviewPropertyDto = DtoWithPagination<{
  propertiesPreview: PropertyPreviewDto[];
}>;
