import { DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constants';
import { PropertyTypeDto } from '@/common/interfaces/property.interfaces';
import { PrismaService } from '@/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DrawToSearchPropertiesDto,
  PreviewPropertyDto,
  PropertyPreviewDto
} from '../interfaces/properties-search.interfaces';
import {
  DrawToSearchPin,
  DrawToSearchResponseDto
} from '../interfaces/property-searching.interfaces';
import { PropertyLocationService } from './property-location.service';

@Injectable()
export class PropertySearchingService {
  constructor(
    private readonly prismaService: PrismaService,
    private locationService: PropertyLocationService
  ) {}

  async drawToSearch(
    data: DrawToSearchPropertiesDto['data']
  ): Promise<DrawToSearchResponseDto> {
    const locationsMap = await this.locationService.getLocationInCoordinates(
      data.geoCoordinates
    );

    const propertyLocationIds = [...locationsMap.keys()];

    if (propertyLocationIds?.length === 0) {
      return {
        pins: []
      };
    }

    const properties = await this.prismaService.property.findMany({
      where: {
        property_details: {
          address: {
            property_location_id: {
              in: propertyLocationIds
            }
          },
          property_type: {
            type: data.propertyType
          }
        },
        relation_type: {
          type: data.relationType
        }
      },
      select: {
        property_id: true,
        price: true,
        property_details: {
          select: {
            address: true
          }
        }
      }
    });

    const drawToSearchPins: DrawToSearchPin[] = propertyLocationIds.map(
      (locationId) => {
        const propertiesForLocation = properties.filter(
          (property) =>
            property.property_details.address.property_location_id ===
            locationId
        );

        const propertyList: DrawToSearchPin['properties'] =
          propertiesForLocation.map((property) => ({
            propertyId: property.property_id,
            price: {
              amount: property.price.amount,
              currency: property.price.currency
            }
          }));

        return {
          geoCoordinates: {
            latitude: locationsMap.get(locationId)?.latitude || 0,
            longitude: locationsMap.get(locationId)?.longitude || 0
          },
          properties: propertyList
        };
      }
    );

    return {
      pins: drawToSearchPins
    };
  }

  async previewPropertiesByCoordinates(
    page: number,
    data: DrawToSearchPropertiesDto['data']
  ): Promise<PreviewPropertyDto> {
    const locationsMap = await this.locationService.getLocationInCoordinates(
      data.geoCoordinates
    );

    const propertyLocationIds = [...locationsMap.keys()];

    if (propertyLocationIds?.length === 0) {
      return {
        propertiesPreview: [],
        lastPage: 1,
        page: 1,
        total: 0
      };
    }

    const totalProperties = await this.prismaService.property.count({
      where: {
        property_details: {
          address: {
            property_location_id: {
              in: propertyLocationIds
            }
          },
          property_type: {
            type: data.propertyType
          }
        },
        relation_type: {
          type: data.relationType
        }
      }
    });

    const lastPage = Math.ceil(totalProperties / DEFAULT_PAGE_SIZE);
    const skip = (page - 1) * DEFAULT_PAGE_SIZE;

    const properties = await this.prismaService.property.findMany({
      where: {
        property_details: {
          address: {
            property_location_id: {
              in: propertyLocationIds
            }
          },
          property_type: {
            type: data.propertyType
          }
        },
        relation_type: {
          type: data.relationType
        }
      },
      select: {
        property_id: true,
        price: true,
        contact_preference: true,
        photos: true,
        property_details: {
          select: {
            address: {
              include: {
                location: true
              }
            },
            property_condition: true,
            surface: true,
            roomNumber: true,
            bathroom_number: true
          }
        }
      },
      take: DEFAULT_PAGE_SIZE,
      skip
    });

    return {
      propertiesPreview: properties.map(
        (property) =>
          ({
            propertyId: property.property_id,
            contactPreference: property.contact_preference.type,
            photos: property.photos.map((photo) => ({
              imageId: photo.upload_image_id
            })),
            price: {
              amount: property.price.amount,
              currency: property.price.currency
            },
            property: {
              address: {
                city: property.property_details.address.city,
                country: property.property_details.address.country,
                county: property.property_details.address.county,
                floor: property.property_details.address.floor,
                postalCode: property.property_details.address.postal_code,
                street: property.property_details.address.street,
                residenceComplex:
                  property.property_details.address.residence_complex,
                streetNumber: property.property_details.address.street_number,
                latitude: locationsMap.get('locationId')?.latitude || 0,
                longitude: locationsMap.get('locationId')?.longitude || 0
              },
              propertyCondition:
                property.property_details.property_condition.type,
              bathroomNumber: property.property_details.bathroom_number,
              roomNumber: property.property_details.roomNumber,
              surface: property.property_details.surface
            }
          }) satisfies PropertyPreviewDto
      ),
      lastPage: lastPage || 1,
      page: Math.min(page, lastPage),
      total: totalProperties
    };
  }

  async getPropertyByIdDtoMapped(
    property_id: string
  ): Promise<PropertyTypeDto> {
    const property = await this.getPropertyById(property_id);

    return {
      propertyId: property.property_id,
      relationType: property.relation_type.type,
      price: {
        amount: property.price.amount,
        currency: property.price.currency
      },
      description: property.description,
      expensesMonthly: {
        amount: property.monthly_expenses.amount,
        currency: property.monthly_expenses.currency
      },
      photos: property.photos.map((photo) => ({
        imageId: photo.upload_image_id
      })),
      property: {
        address: {
          city: property.property_details.address.city,
          country: property.property_details.address.country,
          county: property.property_details.address.county,
          floor: property.property_details.address.floor,
          latitude: property.property_details.address.location.latitude,
          longitude: property.property_details.address.location.longitude,
          postalCode: property.property_details.address.postal_code,
          street: property.property_details.address.street,
          streetNumber: property.property_details.address.street_number,
          residenceComplex: property.property_details.address.residence_complex
        },
        bathroomNumber: property.property_details.bathroom_number,
        roomNumber: property.property_details.roomNumber,
        surface: property.property_details.surface,
        houseFurniture: property.property_details.property_furniture.type,
        propertyType: property.property_details.property_type.type,
        isLastFloor: property.property_details.is_last_floor,
        hasElevator: property.property_details.has_elevator,
        commodities: {
          hasAirConditioning:
            property.property_details.property_commodities.has_air_conditioning,
          hasBalcony:
            property.property_details.property_commodities.has_balcony,
          hasCellar: property.property_details.property_commodities.has_cellar,
          hasClosetInTheWall:
            property.property_details.property_commodities
              .has_closet_in_the_wall,
          hasParking:
            property.property_details.property_commodities.has_parking,
          hasTerrace: property.property_details.property_commodities.has_terrace
        },
        propertyCondition: property.property_details.property_condition.type
      },
      contactPreference: property.contact_preference.type,
      contractDetails: {
        agencyFee: {
          amount: property.property_contract_details.agency_fee.amount,
          currency: property.property_contract_details.agency_fee.currency
        },
        maximumNumberOfTenants:
          property.property_contract_details.maximum_number_of_tenants,
        minimumLeaseTerm: {
          termUnit:
            property.property_contract_details.minimum_lease_term.term_type,
          value: property.property_contract_details.minimum_lease_term.value
        },
        petFriendly: property.property_contract_details.pet_friendly,
        rentInAdvance: {
          amount: property.property_contract_details.rent_in_advance.amount,
          currency: property.property_contract_details.rent_in_advance.currency
        }
      },
      user: {
        userId: property.user.user_id,
        firstName: property.user.first_name,
        lastName: property.user.last_name,
        picture: property.user.picture,
        phoneNumbers: property.user.phone_numbers.map((nr) => ({
          countryCode: nr.country_code,
          isPrimary: nr.is_primary,
          number: nr.number
        }))
      },
      createdAt: property.created_at.toISOString(),
      updatedAt: property.updated_at.toISOString()
    };
  }

  async getPropertyById(property_id: string) {
    const property = await this.prismaService.property.findUnique({
      where: {
        property_id
      },
      include: {
        contact_preference: true,
        monthly_expenses: true,
        photos: true,
        price: true,
        property_contract_details: {
          include: {
            agency_fee: true,
            minimum_lease_term: true,
            rent_in_advance: true
          }
        },
        relation_type: true,
        user: {
          include: {
            phone_numbers: true
          }
        },
        property_details: {
          include: {
            address: {
              include: {
                location: true
              }
            },
            property_commodities: true,
            property_condition: true,
            property_furniture: true,
            property_type: true
          }
        }
      }
    });

    if (!property) {
      throw new NotFoundException();
    }

    const { latitude, longitude } = await this.locationService.getLocation({
      location_id: property.property_details.address.property_location_id
    });

    return {
      ...property,
      property_details: {
        ...property.property_details,
        address: {
          ...property.property_details.address,
          location: {
            ...property.property_details.address.location,
            latitude,
            longitude
          }
        }
      }
    };
  }
}
