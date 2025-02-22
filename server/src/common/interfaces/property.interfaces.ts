import { CurrencyType } from '@/common/interfaces/currency.interfaces';
import {
  ContactPreferenceEnum,
  MinimumLeaseTermUnitEnum,
  PropertyConditionEnum,
  PropertyFurnitureEnum,
  PropertyLocation,
  PropertyTypeEnum,
  RelationTypeEnum
} from '@prisma/client';

export type PropertyAddressDto = {
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

export type MinimumLeaseFeeDto = {
  termUnit: MinimumLeaseTermUnitEnum;
  value: number;
};

export type PropertyPhotoDto = {
  imageId: string;
};

export type PropertyTypeDto = {
  propertyId: string | null;
  relationType: RelationTypeEnum;
  price: CurrencyType;
  description?: string | null;
  expensesMonthly: CurrencyType;
  contactPreference: ContactPreferenceEnum;
  property: {
    propertyType: PropertyTypeEnum;
    propertyCondition: PropertyConditionEnum;
    address: PropertyAddressDto;
    isLastFloor: boolean;
    surface: number;
    roomNumber: number;
    bathroomNumber: number;
    hasElevator: boolean;
    houseFurniture: PropertyFurnitureEnum;
    commodities: {
      hasAirConditioning: boolean;
      hasClosetInTheWall: boolean;
      hasBalcony: boolean;
      hasCellar: boolean;
      hasParking: boolean;
      hasTerrace: boolean;
    };
  };
  contractDetails: {
    maximumNumberOfTenants: number | null;
    petFriendly: boolean;
    agencyFee: CurrencyType;
    minimumLeaseTerm: MinimumLeaseFeeDto;
    rentInAdvance: CurrencyType;
  };
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    picture: string | null;
    phoneNumbers: {
      countryCode: string;
      number: string;
      isPrimary: boolean;
    }[];
  };
  photos: PropertyPhotoDto[];
  createdAt: string;
  updatedAt: string;
};