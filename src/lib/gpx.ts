import { LatLng } from './types';

export function toGPX(coords: LatLng[]): string {
  const trkpts = coords.map(p => `<trkpt lat="${p.lat}" lon="${p.lng}"/>`).join('');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<gpx version="1.1" creator="Laufstrecken">' +
    `<trk><name>Laufstrecke</name><trkseg>${trkpts}</trkseg></trk>` +
    '</gpx>'
  );
}
