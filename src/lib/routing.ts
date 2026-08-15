import { LatLng } from './types';

const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_KEY;
const ORS_ENDPOINT = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
const SEED_BASE = 8;
const REQUEST_TIMEOUT_MS = 30_000;

interface OrsRoute {
  coordinates: LatLng[];
  km: number;
  maxGapM: number;
  mainRoadShare: number;
}

function haversineM(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const MAIN_ROAD_RE = /^(K|L|B|A)\s?\d/i;

function scoreRoute(route: OrsRoute, requestedKm: number): number {
  const distPenalty = (Math.abs(route.km - requestedKm) / requestedKm) * 10;
  const gapPenalty = Math.max(0, route.maxGapM - 250) / 50;
  const roadPenalty = route.mainRoadShare / 2;
  return distPenalty + gapPenalty + roadPenalty;
}

async function fetchRoute(start: LatLng, km: number, seed: number): Promise<OrsRoute | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(ORS_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: ORS_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates: [[start.lng, start.lat]],
        options: {
          round_trip: { length: km * 1000, points: 3, seed },
        },
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const geojson = await res.json();
    const feature = geojson?.features?.[0];
    const coords: [number, number][] = feature?.geometry?.coordinates ?? [];
    if (coords.length === 0) return null;

    const points: LatLng[] = coords.map(([lng, lat]) => ({ lat, lng }));
    let maxGapM = 0;
    for (let i = 1; i < points.length; i++) {
      maxGapM = Math.max(maxGapM, haversineM(points[i - 1], points[i]));
    }

    const totalM = feature.properties.summary.distance;
    let mainRoadM = 0;
    for (const step of feature.properties.segments[0].steps) {
      if (MAIN_ROAD_RE.test((step.name ?? '').trim())) mainRoadM += step.distance;
    }

    return {
      coordinates: points,
      km: totalM / 1000,
      maxGapM: Math.round(maxGapM),
      mainRoadShare: totalM > 0 ? (mainRoadM / totalM) * 100 : 0,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateRoute(start: LatLng, km: number, batch = 0): Promise<LatLng[]> {
  if (!ORS_API_KEY) {
    throw new Error(
      'Kein openrouteservice-API-Key gesetzt. Lege EXPO_PUBLIC_ORS_KEY in der .env-Datei fest (siehe .env.example).'
    );
  }

  const seeds = Array.from({ length: SEED_BASE }, (_, i) => batch * SEED_BASE + i + 1);
  const results = await Promise.all(seeds.map((seed) => fetchRoute(start, km, seed)));
  const routes = results.filter((r): r is OrsRoute => r !== null);
  if (routes.length === 0) {
    throw new Error(
      'openrouteservice hat keine Route gefunden. Startpunkt oder Distanz prüfen – in sehr ländlichen Gebieten kann die Wunschdistanz zu groß sein.'
    );
  }

  routes.sort((a, b) => scoreRoute(a, km) - scoreRoute(b, km));
  return routes[0].coordinates;
}