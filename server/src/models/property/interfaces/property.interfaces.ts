import { PropertyLocation } from "@prisma/client";

export type PropertyLocationWithCoordinates = PropertyLocation & {
  latitude: number;
  longitude: number;
};

export type PropertyLocationWithCoordinatesMap = Map<
  PropertyLocation['property_location_id'],
  {
    latitude: number;
    longitude: number;
  }
>;
