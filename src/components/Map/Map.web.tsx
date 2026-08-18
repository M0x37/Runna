import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLng } from '@/lib/types';
import { MapProps } from './Map.types';

const DEFAULT_CENTER: [number, number] = [52.5, 13.4];

const startIcon = L.divIcon({
  className: '',
  html: '<div style="width:27px;height:27px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#D8FF39;border:3px solid #ffffff;box-shadow:0 3px 12px rgba(0,0,0,.35)"></div>',
  iconSize: [27, 27],
  iconAnchor: [13, 27],
});

const liveIcon = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:50%;background:#FF6B35;border:4px solid #ffffff;box-shadow:0 0 0 3px rgba(255,107,53,.28),0 3px 12px rgba(0,0,0,.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function ClickHandler({ onMapPress }: Pick<MapProps, 'onMapPress'>) {
  useMapEvents({ click: event => onMapPress?.({ lat: event.latlng.lat, lng: event.latlng.lng }) });
  return null;
}

function FollowPoint({ point }: { point?: LatLng }) {
  const map = useMap();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!point) return;
    const key = `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`;
    if (last.current === key) return;
    last.current = key;
    map.panTo([point.lat, point.lng], { animate: true, duration: 0.4 });
  }, [map, point]);
  return null;
}

function FitBounds({ route }: { route: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 1) {
      map.fitBounds(route.map(point => [point.lat, point.lng] as [number, number]), { padding: [48, 48] });
    }
  }, [map, route]);
  return null;
}

export function Map({ route, startPoint, livePosition, onMapPress }: MapProps) {
  const center: [number, number] = startPoint ? [startPoint.lat, startPoint.lng] : DEFAULT_CENTER;
  const positions = route.map(point => [point.lat, point.lng] as [number, number]);

  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapPress={onMapPress} />
      <FollowPoint point={livePosition} />
      <FitBounds route={route} />
      {startPoint && <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon} />}
      {livePosition && <Marker position={[livePosition.lat, livePosition.lng]} icon={liveIcon} />}
      {route.length > 0 && (
        <>
          <Polyline positions={positions} pathOptions={{ color: '#080808', weight: 10, opacity: 0.42 }} />
          <Polyline positions={positions} pathOptions={{ color: '#D8FF39', weight: 5, opacity: 0.98 }} />
        </>
      )}
    </MapContainer>
  );
}
