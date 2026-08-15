import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLng } from '@/lib/types';
import { MapProps } from './Map.types';

const DEFAULT_CENTER: [number, number] = [52.5, 13.4];

const startIcon = L.divIcon({
  className: '',
  html: '<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#2563eb;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

function ClickHandler({ onMapPress }: Pick<MapProps, 'onMapPress'>) {
  useMapEvents({ click: e => onMapPress?.({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function FollowStartPoint({ startPoint }: Pick<MapProps, 'startPoint'>) {
  const map = useMap();
  useEffect(() => {
    if (!startPoint) return;
    map.setView([startPoint.lat, startPoint.lng], Math.max(map.getZoom(), 14));
  }, [map, startPoint]);
  return null;
}

function FitBounds({ route }: { route: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 1) {
      map.fitBounds(route.map(p => [p.lat, p.lng] as [number, number]), { padding: [48, 48] });
    }
  }, [map, route]);
  return null;
}

export function Map({ route, startPoint, onMapPress }: MapProps) {
  const center: [number, number] = startPoint
    ? [startPoint.lat, startPoint.lng]
    : DEFAULT_CENTER;
  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapPress={onMapPress} />
      <FollowStartPoint startPoint={startPoint} />
      <FitBounds route={route} />
      {startPoint && <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon} />}
      {route.length > 0 && (
        <Polyline
          positions={route.map(p => [p.lat, p.lng] as [number, number])}
          pathOptions={{ color: '#FC4C02', weight: 4 }}
        />
      )}
    </MapContainer>
  );
}
