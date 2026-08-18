import { LatLng } from './types';

function toXY(p: LatLng, ref: LatLng) {
  const latRad = (ref.lat * Math.PI) / 180;
  const x = (p.lng - ref.lng) * 111_320 * Math.cos(latRad);
  const y = (p.lat - ref.lat) * 110_540;
  return { x, y };
}

function pointToSegmentM(p: LatLng, a: LatLng, b: LatLng): number {
  const ref = { lat: (p.lat + a.lat + b.lat) / 3, lng: (p.lng + a.lng + b.lng) / 3 };
  const P = toXY(p, ref);
  const A = toXY(a, ref);
  const B = toXY(b, ref);
  const abx = B.x - A.x;
  const aby = B.y - A.y;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return Math.hypot(P.x - A.x, P.y - A.y);
  let t = ((P.x - A.x) * abx + (P.y - A.y) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = A.x + t * abx;
  const cy = A.y + t * aby;
  return Math.hypot(P.x - cx, P.y - cy);
}

export function distanceToRouteM(pos: LatLng, coords: LatLng[]): number {
  if (coords.length === 0) return Infinity;
  if (coords.length === 1) return pointToSegmentM(pos, coords[0], coords[0]);
  let min = Infinity;
  for (let i = 1; i < coords.length; i++) {
    min = Math.min(min, pointToSegmentM(pos, coords[i - 1], coords[i]));
  }
  return min;
}