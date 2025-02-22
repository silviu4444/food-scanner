import { PrismaService } from '@/prisma.service';
import { CloudinaryService } from '@/providers/cloudinary';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUpdatePropertyDtoType } from '../interfaces/create-update-property.interfaces';
import { PropertyLocationService } from './property-location.service';
import { PropertySearchingService } from './property-searching.service';

type AddPropertyProps = {
  user_id: string;
  data: CreateUpdatePropertyDtoType;
};

type UpdatePropertyProps = {
  user_id: string;
  data: CreateUpdatePropertyDtoType;
};

@Injectable()
export class CreateUpdatePropertyService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly propertySearching: PropertySearchingService,
    private locationService: PropertyLocationService,
    private cloudinaryService: CloudinaryService
  ) {}

  async addProperty({ user_id, data }: AddPropertyProps) {
    const uploadedImagesNotOk = data.photos.some(
      (photo) =>
        !this.cloudinaryService.isUploadOk({
          public_id: photo.imageId,
          signature: photo.uploadedPhotoSignature,
          version: photo.version
        })
    );

    if (uploadedImagesNotOk) {
      throw new HttpException(
        'Invalid images signature!',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      return this.prismaService.$transaction(async (prisma) => {
        const contact_preference = await prisma.contactPreference.findFirst({
          where: {
            type: data.contactPreference
          }
        });

        const relation_type = await prisma.relationType.findFirst({
          where: {
            type: data.relationType
          }
        });

        const monthly_expenses = await prisma.monthlyExpense.create({
          data: {
            amount: data.expensesMonthly.amount,
            currency: data.expensesMonthly.currency
          }
        });

        const price = await prisma.propertyPrice.create({
          data: {
            amount: data.price.amount,
            currency: data.price.currency
          }
        });

        const property_condition = await prisma.propertyCondition.findFirst({
          where: {
            type: data.property.propertyCondition
          }
        });

        const property_commodities = await prisma.propertyCommodities.create({
          data: {
            has_air_conditioning: data.property.commodities.hasAirConditioning,
            has_balcony: data.property.commodities.hasBalcony,
            has_cellar: data.property.commodities.hasCellar,
            has_closet_in_the_wall:
              data.property.commodities.hasClosetInTheWall,
            has_parking: data.property.commodities.hasParking,
            has_terrace: data.property.commodities.hasTerrace
          }
        });

        const property_type = await prisma.propertyType.findFirst({
          where: {
            type: data.property.propertyType
          }
        });

        const property_furniture = await prisma.propertyFurniture.findFirst({
          where: {
            type: data.property.houseFurniture
          }
        });

        const location = await this.locationService.createLocation({
          prisma: prisma as PrismaClient,
          latitude: data.property.address.latitude,
          longitude: data.property.address.longitude
        });

        const property_address = await prisma.propertyAddress.create({
          data: {
            city: data.property.address.city,
            country: data.property.address.country,
            county: data.property.address.county,
            floor: data.property.address.floor,
            postal_code: data.property.address.postalCode,
            street: data.property.address.street,
            residence_complex: data.property.address.residenceComplex || null,
            street_number: data.property.address.streetNumber || null,
            property_location_id: location.property_location_id
          }
        });

        const property_details = await prisma.propertyDetails.create({
          data: {
            bathroom_number: data.property.bathroomNumber,
            roomNumber: data.property.roomNumber,
            is_last_floor: data.property.isLastFloor,
            has_elevator: data.property.hasElevator,
            surface: data.property.surface,
            property_condition_id: property_condition!.property_condition_id,
            property_commodities_id:
              property_commodities.property_commodities_id,
            property_type_id: property_type!.property_type_id,
            property_furniture_id: property_furniture!.property_furniture_id,
            property_address_id: property_address.property_address_id
          }
        });

        const agency_fee = await prisma.agencyFee.create({
          data: {
            amount: data.property.agencyFee.amount,
            currency: data.property.agencyFee.currency
          }
        });

        const minimum_lease_term = await prisma.minimumLeaseTerm.create({
          data: {
            term_type: data.property.minimumLeaseTerm.type,
            value: data.property.minimumLeaseTerm.value
          }
        });

        const rent_in_advance = await prisma.rentInAdvance.create({
          data: {
            amount: data.property.rentInAdvance.amount,
            currency: data.property.rentInAdvance.currency
          }
        });

        const property_contract_details =
          await prisma.propertyContractDetails.create({
            data: {
              maximum_number_of_tenants: data.property.maximumNumberOfTenants,
              pet_friendly: data.property.petFriendly,
              agency_fee_id: agency_fee.agency_fee_id,
              minimum_lease_term_id: minimum_lease_term.minimum_lease_term_id,
              rent_in_advance_id: rent_in_advance.rent_in_advance_id
            }
          });

        await prisma.property.create({
          data: {
            user_id,
            contact_preference_id: contact_preference!.contact_preference_id,
            monthly_expense_id: monthly_expenses.monthly_expense_id,
            price_id: price.price_id,
            relation_type_id: relation_type!.relation_type_id,
            description: data.description || null,
            property_details_id: property_details.property_details_id,
            property_contract_details_id:
              property_contract_details.property_contract_details_id,
            photos: {
              create: data.photos.map((photo) => ({
                upload_image_id: photo.imageId
              }))
            }
          }
        });

        return { message: 'Property created successfully!' };
      });
    } catch (error) {
      Logger.error('Creating the property failed', error);
      throw new InternalServerErrorException();
    }
  }

  async updateProperty({ user_id, data }: UpdatePropertyProps) {
    if (!data.propertyId) {
      throw new BadRequestException('Invalid property id!');
    }

    const property = await this.propertySearching.getPropertyById(
      data.propertyId
    );

    if (property.user_id !== user_id) {
      throw new ForbiddenException();
    }

    try {
      return this.prismaService.$transaction(async (prisma) => {
        const contact_preference = await prisma.contactPreference.findFirst({
          where: {
            type: data.contactPreference
          }
        });

        const relation_type = await prisma.relationType.findFirst({
          where: {
            type: data.relationType
          }
        });

        await prisma.monthlyExpense.update({
          where: {
            monthly_expense_id: property.monthly_expense_id
          },
          data: {
            amount: data.expensesMonthly.amount,
            currency: data.expensesMonthly.currency
          }
        });

        await prisma.propertyPrice.update({
          where: {
            price_id: property.price_id
          },
          data: {
            amount: data.price.amount,
            currency: data.price.currency
          }
        });

        const property_condition = await prisma.propertyCondition.findFirst({
          where: {
            type: data.property.propertyCondition
          }
        });

        const property_commodities = await prisma.propertyCommodities.update({
          where: {
            property_commodities_id:
              property.property_details.property_commodities_id
          },
          data: {
            has_air_conditioning: data.property.commodities.hasAirConditioning,
            has_balcony: data.property.commodities.hasBalcony,
            has_cellar: data.property.commodities.hasCellar,
            has_closet_in_the_wall:
              data.property.commodities.hasClosetInTheWall,
            has_parking: data.property.commodities.hasParking,
            has_terrace: data.property.commodities.hasTerrace
          }
        });

        const property_type = await prisma.propertyType.findFirst({
          where: {
            type: data.property.propertyType
          }
        });

        const property_furniture = await prisma.propertyFurniture.findFirst({
          where: {
            type: data.property.houseFurniture
          }
        });

        await this.locationService.updateLocation({
          locationId:
            property.property_details.address.location.property_location_id,
          prisma: prisma as PrismaClient,
          latitude: data.property.address.latitude,
          longitude: data.property.address.longitude
        });

        const property_address = await prisma.propertyAddress.update({
          where: {
            property_address_id:
              property.property_details.address.property_address_id
          },
          data: {
            city: data.property.address.city,
            country: data.property.address.country,
            county: data.property.address.county,
            floor: data.property.address.floor,
            postal_code: data.property.address.postalCode,
            street: data.property.address.street,
            residence_complex: data.property.address.residenceComplex || null,
            street_number: data.property.address.streetNumber || null
          }
        });

        await prisma.propertyDetails.update({
          where: {
            property_details_id: property.property_details.property_details_id
          },
          data: {
            bathroom_number: data.property.bathroomNumber,
            roomNumber: data.property.roomNumber,
            is_last_floor: data.property.isLastFloor,
            has_elevator: data.property.hasElevator,
            surface: data.property.surface,
            property_condition_id: property_condition!.property_condition_id,
            property_commodities_id:
              property_commodities.property_commodities_id,
            property_type_id: property_type!.property_type_id,
            property_furniture_id: property_furniture!.property_furniture_id,
            property_address_id: property_address.property_address_id
          }
        });

        const agency_fee = await prisma.agencyFee.update({
          where: {
            agency_fee_id: property.property_contract_details.agency_fee_id
          },
          data: {
            amount: data.property.agencyFee.amount,
            currency: data.property.agencyFee.currency
          }
        });

        const minimum_lease_term = await prisma.minimumLeaseTerm.update({
          where: {
            minimum_lease_term_id:
              property.property_contract_details.minimum_lease_term_id
          },
          data: {
            term_type: data.property.minimumLeaseTerm.type,
            value: data.property.minimumLeaseTerm.value
          }
        });

        const rent_in_advance = await prisma.rentInAdvance.update({
          where: {
            rent_in_advance_id:
              property.property_contract_details.rent_in_advance_id
          },
          data: {
            amount: data.property.rentInAdvance.amount,
            currency: data.property.rentInAdvance.currency
          }
        });

        await prisma.propertyContractDetails.update({
          where: {
            property_contract_details_id:
              property.property_contract_details.property_contract_details_id
          },
          data: {
            maximum_number_of_tenants: data.property.maximumNumberOfTenants,
            pet_friendly: data.property.petFriendly,
            agency_fee_id: agency_fee.agency_fee_id,
            minimum_lease_term_id: minimum_lease_term.minimum_lease_term_id,
            rent_in_advance_id: rent_in_advance.rent_in_advance_id
          }
        });

        await prisma.property.update({
          where: {
            property_id: property.property_id
          },
          data: {
            contact_preference_id: contact_preference!.contact_preference_id,
            relation_type_id: relation_type!.relation_type_id,
            description: data.description || null
          }
        });

        return { message: 'Property updated successfully!' };
      });
    } catch (error) {
      Logger.error('Updating the property failed', error);
      throw new InternalServerErrorException();
    }
  }
}
