import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map as MapLibreMap,
  Marker,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import { MapProps } from './Map.types';

// OpenFreeMap: kostenlos für immer, kein API-Key, OSM-Daten
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

const toLngLat = (p: { lat: number; lng: number }) => [p.lng, p.lat] as [number, number];

export function Map({ route, startPoint, onMapPress }: MapProps) {
  const cameraRef = useRef<CameraRef>(null);
  const lastStartKey = useRef<string | null>(null);

  useEffect(() => {
    if (!startPoint) return;
    const key = `${startPoint.lat.toFixed(5)},${startPoint.lng.toFixed(5)}`;
    if (lastStartKey.current === key) return;
    lastStartKey.current = key;
    cameraRef.current?.flyTo({ center: toLngLat(startPoint), zoom: 15, duration: 400 });
  }, [startPoint]);

  useEffect(() => {
    if (route.length < 2) return;
    const lats = route.map(p => p.lat);
    const lngs = route.map(p => p.lng);
    cameraRef.current?.fitBounds(
      [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
      { padding: { top: 64, right: 48, bottom: 64, left: 48 }, duration: 400 }
    );
  }, [route]);

  return (
    <MapLibreMap
      style={{ flex: 1 }}
      mapStyle={MAP_STYLE}
      onPress={e =>
        onMapPress?.({ lat: e.nativeEvent.lngLat[1], lng: e.nativeEvent.lngLat[0] })
      }
    >
      <Camera
        ref={cameraRef}
        initialViewState={
          startPoint
            ? { center: toLngLat(startPoint), zoom: 14 }
            : { center: [13.4, 52.5], zoom: 12 }
        }
      />
      {route.length > 0 && (
        <GeoJSONSource
          id="route-source"
          data={{
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: route.map(toLngLat),
                },
              },
            ],
          }}
        >
          <Layer
            id="route-line"
            type="line"
            source="route-source"
            paint={{ 'line-color': '#FC4C02', 'line-width': 4 }}
          />
        </GeoJSONSource>
      )}
      {startPoint && (
        <Marker id="start" lngLat={toLngLat(startPoint)} anchor="bottom">
          <View className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
        </Marker>
      )}
    </MapLibreMap>
  );
}