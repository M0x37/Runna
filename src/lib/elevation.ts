import { LatLng } from './types';

export interface ElevationProfile {
  elevations: number[];
  min: number;
  max: number;
  ascent: number;
}

function downsample(coords: LatLng[], maxPoints: number): LatLng[] {
  if (coords.length <= maxPoints) return coords;
  const step = (coords.length - 1) / (maxPoints - 1);
  const out: LatLng[] = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(coords[Math.round(i * step)]);
  }
  return out;
}

export async function fetchElevation(coords: LatLng[]): Promise<ElevationProfile> {
  const points = downsample(coords, 100);
  const lats = points.map(p => p.lat.toFixed(5)).join(',');
  const lngs = points.map(p => p.lng.toFixed(5)).join(',');
  const res = await fetch(
    `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`
  );
  if (!res.ok) throw new Error(`Höhendaten-Fehler (${res.status})`);
  const data = await res.json();
  const elevations: number[] = data?.elevation ?? [];
  if (elevations.length === 0) throw new Error('Keine Höhendaten erhalten.');

  let min = Infinity;
  let max = -Infinity;
  let ascent = 0;
  for (let i = 0; i < elevations.length; i++) {
    min = Math.min(min, elevations[i]);
    max = Math.max(max, elevations[i]);
    if (i > 0 && elevations[i] > elevations[i - 1]) {
      ascent += elevations[i] - elevations[i - 1];
    }
  }
  return { elevations, min, max, ascent: Math.round(ascent) };
}