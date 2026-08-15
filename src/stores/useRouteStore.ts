import { create } from 'zustand';
import { LatLng } from '@/lib/types';

type RouteStore = {
  draft: { start?: LatLng; km: number; coords: LatLng[] };
  setDraftStart: (start: LatLng) => void;
  setDraftKm: (km: number) => void;
  setDraftCoords: (coords: LatLng[]) => void;
};

export const useRouteStore = create<RouteStore>(set => ({
  draft: { km: 5, coords: [] },
  setDraftStart: start => set(s => ({ draft: { ...s.draft, start } })),
  setDraftKm: km => set(s => ({ draft: { ...s.draft, km } })),
  setDraftCoords: coords => set(s => ({ draft: { ...s.draft, coords } })),
}));
