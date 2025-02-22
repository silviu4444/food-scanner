import { PrismaService } from '@/prisma.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { PrismaClient, PropertyLocation } from '@prisma/client';
import { randomUUID } from 'crypto';
import { GeoCoordinatesDto } from '../interfaces/properties-search.interfaces';
import {
  PropertyLocationWithCoordinates,
  PropertyLocationWithCoordinatesMap
} from '../interfaces/property.interfaces';

type CreateUpdateLocationProps = {
  prisma: PrismaClient;
  latitude: number;
  longitude: number;
};

type GetLocationProps = {
  location_id: string;
};

@Injectable()
export class PropertyLocationService {
  constructor(private readonly prismaService: PrismaService) {}

  async getLocation({
    location_id
  }: GetLocationProps): Promise<{ latitude: number; longitude: number }> {
    const result = (await this.prismaService.$queryRaw`
      SELECT ST_Y(location) as latitude, ST_X(location) as longitude 
      FROM "PropertyLocation"
      WHERE property_location_id = ${location_id}
    `) as { latitude: number; longitude: number }[];

    return result[0];
  }

  async getLocationInCoordinates(
    coordinates: GeoCoordinatesDto[]
  ): Promise<PropertyLocationWithCoordinatesMap> {
    try {
      if (coordinates.length > 4) {
        return this.queryLocationsForPolygon(coordinates);
      }

      return this.queryLocationsForBounds(coordinates);
    } catch (error) {
      Logger.error('[getLocationInCoordinates]', error);
      throw new InternalServerErrorException();
    }
  }

  async createLocation({
    prisma,
    latitude,
    longitude
  }: CreateUpdateLocationProps): Promise<PropertyLocation> {
    try {
      const point = `POINT(${longitude} ${latitude})`;
      const locationId = randomUUID();
      const result = await prisma.$queryRaw<PropertyLocation[]>`
          INSERT INTO "PropertyLocation" ("property_location_id", location) 
          VALUES (${locationId}, ST_GeomFromText(${point}, 4326))
          RETURNING property_location_id`;

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async updateLocation({
    locationId,
    prisma,
    latitude,
    longitude
  }: {
    locationId: string;
  } & CreateUpdateLocationProps): Promise<void> {
    try {
      const point = `POINT(${longitude} ${latitude})`;

      await prisma.$queryRaw<PropertyLocation>`
        UPDATE "PropertyLocation"
        SET
          location = ST_GeomFromText(${point}, 4326)
        WHERE property_location_id = ${locationId}
      `;
    } catch (error) {
      throw error;
    }
  }

  private formatPolygonWKT(coordinates: GeoCoordinatesDto[]): string {
    const wktCoordinates = coordinates.map(
      ({ longitude, latitude }) => `${longitude} ${latitude}`
    );

    if (wktCoordinates[0] !== wktCoordinates[wktCoordinates.length - 1]) {
      wktCoordinates.push(wktCoordinates[0]);
    }

    return `POLYGON((${wktCoordinates.join(', ')}))`;
  }

  private async queryLocationsForPolygon(
    coordinates: GeoCoordinatesDto[]
  ): Promise<PropertyLocationWithCoordinatesMap> {
    const locations = await this.prismaService.$queryRaw<
      PropertyLocationWithCoordinates[]
    >`SELECT
     property_location_id,
     ST_Y(location) as latitude, 
     ST_X(location) as longitude 
     FROM "PropertyLocation"
     WHERE ST_Contains(
     ST_GeomFromText(${this.formatPolygonWKT(coordinates)}, 4326),
     location
     )`;

    if (locations?.length) {
      return new Map(
        locations.map((location) => [location.property_location_id, location])
      );
    }

    return new Map();
  }

  private async queryLocationsForBounds(
    coordinates: GeoCoordinatesDto[]
  ): Promise<PropertyLocationWithCoordinatesMap> {
    const [north, south] = [coordinates[0].latitude, coordinates[2].latitude];
    const [east, west] = [coordinates[0].longitude, coordinates[1].longitude];

    const locations = await this.prismaService.$queryRaw<
      PropertyLocationWithCoordinates[]
    >`SELECT
     property_location_id,
     ST_Y(location) as latitude, 
     ST_X(location) as longitude 
     FROM "PropertyLocation"
     WHERE ST_Within(
     location, 
     ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
     )`;

    if (locations?.length) {
      return new Map(
        locations.map((location) => [location.property_location_id, location])
      );
    }

    return new Map();
  }
}
