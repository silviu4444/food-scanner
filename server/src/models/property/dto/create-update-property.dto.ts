import { CurrencyTypeDto } from '@/common/dto/currency.dto';
import { CurrencyType } from '@/common/interfaces/currency.interfaces';
import { Dto } from '@/common/interfaces/dto.interfaces';
import {
  ContactPreferenceEnum,
  MinimumLeaseTermUnitEnum,
  PropertyConditionEnum,
  PropertyFurnitureEnum,
  PropertyTypeEnum,
  RelationTypeEnum
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested
} from 'class-validator';
import {
  CreateUpdateMinimumLeaseFeeDtoType,
  CreateUpdatePhotosDtoType,
  CreateUpdatePropertyAddressDtoType,
  CreateUpdatePropertyCommoditiesDtoType,
  CreateUpdatePropertyDetailsDtoType,
  CreateUpdatePropertyDtoType
} from '../interfaces/create-update-property.interfaces';

class PropertyAddress implements CreateUpdatePropertyAddressDtoType {
  @IsOptional()
  @IsString()
  residenceComplex?: string | null;

  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  streetNumber?: string | null;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsString()
  county: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsString()
  floor: string;
}

class MinimumLeaseFee implements CreateUpdateMinimumLeaseFeeDtoType {
  @IsEnum(MinimumLeaseTermUnitEnum)
  type: MinimumLeaseTermUnitEnum;

  @IsNumber()
  value: number;
}

class Commodities implements CreateUpdatePropertyCommoditiesDtoType {
  @IsBoolean()
  hasAirConditioning: boolean;
  @IsBoolean()
  hasBalcony: boolean;
  @IsBoolean()
  hasCellar: boolean;
  @IsBoolean()
  hasClosetInTheWall: boolean;
  @IsBoolean()
  hasParking: boolean;
  @IsBoolean()
  hasTerrace: boolean;
}

class PropertyDetails implements CreateUpdatePropertyDetailsDtoType {
  @ValidateNested()
  @Type(() => PropertyAddress)
  address: CreateUpdatePropertyAddressDtoType;

  @IsNumber()
  @Min(0)
  bathroomNumber: number;

  @IsNumber()
  @Min(0)
  roomNumber: number;

  @IsObject()
  @ValidateNested()
  @Type(() => Commodities)
  commodities: {
    hasAirConditioning: boolean;
    hasBalcony: boolean;
    hasCellar: boolean;
    hasClosetInTheWall: boolean;
    hasParking: boolean;
    hasTerrace: boolean;
  };

  @IsBoolean()
  hasElevator: boolean;

  @IsEnum(PropertyFurnitureEnum)
  houseFurniture: PropertyFurnitureEnum;

  @IsBoolean()
  isLastFloor: boolean;

  @IsEnum(PropertyConditionEnum)
  propertyCondition: PropertyConditionEnum;

  @IsEnum(PropertyTypeEnum)
  propertyType: PropertyTypeEnum;

  @IsNumber()
  @IsPositive()
  surface: number;

  @ValidateNested()
  @Type(() => CurrencyTypeDto)
  agencyFee: CurrencyType;

  @ValidateNested()
  @Type(() => MinimumLeaseFee)
  minimumLeaseTerm: CreateUpdateMinimumLeaseFeeDtoType;

  @IsOptional()
  @IsNumber()
  maximumNumberOfTenants: number | null;

  @IsBoolean()
  petFriendly: boolean;

  @ValidateNested()
  @Type(() => CurrencyTypeDto)
  rentInAdvance: CurrencyType;

  @IsOptional()
  @IsString()
  residentialComplex: string | null;
}

class PhotosDto implements CreateUpdatePhotosDtoType {
  @IsString()
  imageId: string;

  @IsOptional()
  @IsString()
  uploadedPhotoSignature: string;

  @IsOptional()
  @IsNumber()
  version: number;
}

class CreateUpdateProperty implements CreateUpdatePropertyDtoType {
  @IsOptional()
  @IsUUID()
  propertyId: string | null | undefined;

  @ValidateNested()
  @Type(() => CurrencyTypeDto)
  price: CurrencyType;

  @IsString()
  @IsOptional()
  description: string | null | undefined;

  @ValidateNested()
  @Type(() => CurrencyTypeDto)
  expensesMonthly: CurrencyType;

  @ValidateNested()
  @Type(() => PropertyDetails)
  property: CreateUpdatePropertyDetailsDtoType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotosDto)
  photos: CreateUpdatePhotosDtoType[];

  @IsEnum(ContactPreferenceEnum)
  contactPreference: ContactPreferenceEnum;

  @IsEnum(RelationTypeEnum)
  relationType: RelationTypeEnum;
}

export class CreateUpdatePropertyClassValidator
  implements Dto<CreateUpdatePropertyDtoType>
{
  @ValidateNested()
  @Type(() => CreateUpdateProperty)
  data: CreateUpdatePropertyDtoType;
}
