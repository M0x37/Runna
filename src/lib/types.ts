export interface LatLng {
  lat: number;
  lng: number;
}

export interface SavedRoute {
  id: string;
  name: string;
  distanceKm: number;
  createdAt: string;
  start: LatLng;
  coords: LatLng[];
  favorite?: boolean;
}
