import { PropertyTypeEnum, RelationTypeEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  ValidateNested
} from 'class-validator';
import {
  DrawToSearchPropertiesDto,
  GeoCoordinatesDto
} from '../interfaces/properties-search.interfaces';

class GeoCoordinatesDtoClassValidator implements GeoCoordinatesDto {
  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}

class DrawToSearchPropertiesData {
  @IsEnum(RelationTypeEnum)
  relationType: RelationTypeEnum;

  @IsEnum(PropertyTypeEnum)
  propertyType: PropertyTypeEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeoCoordinatesDtoClassValidator)
  @ArrayMinSize(4)
  geoCoordinates: GeoCoordinatesDto[];
}

export class DrawToSearchDtoClassValidator
  implements DrawToSearchPropertiesDto
{
  @ValidateNested()
  @Type(() => DrawToSearchPropertiesData)
  data: DrawToSearchPropertiesDto['data'];
}
