import { CurrencyType } from '@/common/interfaces/currency.interfaces';
import {
  ContactPreferenceEnum,
  MinimumLeaseTermUnitEnum,
  PropertyConditionEnum,
  PropertyFurnitureEnum,
  PropertyTypeEnum,
  RelationTypeEnum
} from '@prisma/client';

export type CreateUpdatePropertyAddressDtoType = {
  residenceComplex?: string | null;
  street: string;
  streetNumber?: string | null;
  city: string;
  postalCode: string;
  country: string;
  county: string;
  latitude: number;
  longitude: number;
  floor: string;
};

export type CreateUpdateMinimumLeaseFeeDtoType = {
  type: MinimumLeaseTermUnitEnum;
  value: number;
};

export type CreateUpdatePropertyCommoditiesDtoType = {
  hasAirConditioning: boolean;
  hasBalcony: boolean;
  hasCellar: boolean;
  hasClosetInTheWall: boolean;
  hasParking: boolean;
  hasTerrace: boolean;
};

export type CreateUpdatePropertyDetailsDtoType = {
  address: CreateUpdatePropertyAddressDtoType;
  bathroomNumber: number;
  roomNumber: number;
  commodities: CreateUpdatePropertyCommoditiesDtoType;
  hasElevator: boolean;
  houseFurniture: PropertyFurnitureEnum;
  isLastFloor: boolean;
  propertyCondition: PropertyConditionEnum;
  propertyType: PropertyTypeEnum;
  surface: number;
  agencyFee: CurrencyType;
  minimumLeaseTerm: CreateUpdateMinimumLeaseFeeDtoType;
  maximumNumberOfTenants: number | null;
  petFriendly: boolean;
  rentInAdvance: CurrencyType;
  residentialComplex: string | null;
};

export type CreateUpdatePhotosDtoType = {
  imageId: string;
  uploadedPhotoSignature: string;
  version: number;
};

export type CreateUpdatePropertyDtoType = {
  propertyId: string | null | undefined;
  price: CurrencyType;
  description: string | null | undefined;
  expensesMonthly: CurrencyType;
  property: CreateUpdatePropertyDetailsDtoType;
  photos: CreateUpdatePhotosDtoType[];
  contactPreference: ContactPreferenceEnum;
  relationType: RelationTypeEnum;
};
