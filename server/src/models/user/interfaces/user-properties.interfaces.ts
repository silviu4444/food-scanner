import { DtoWithPagination } from '@/common/interfaces/dto.interfaces';
import { PropertyTypeDto } from '@/common/interfaces/property.interfaces';

export type PropertiesByUser = DtoWithPagination<{
  properties: PropertyTypeDto[];
}>;
