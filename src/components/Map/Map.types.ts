import { LatLng } from '@/lib/types';

export interface MapProps {
  route: LatLng[];
  startPoint?: LatLng;
  onMapPress?: (coord: LatLng) => void;
}
