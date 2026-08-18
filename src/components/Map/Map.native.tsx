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

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

const toLngLat = (point: { lat: number; lng: number }) => [point.lng, point.lat] as [number, number];

export function Map({ route, startPoint, livePosition, onMapPress }: MapProps) {
  const cameraRef = useRef<CameraRef>(null);
  const lastStartKey = useRef<string | null>(null);
  const lastLiveKey = useRef<string | null>(null);

  useEffect(() => {
    if (!startPoint) return;
    const key = `${startPoint.lat.toFixed(5)},${startPoint.lng.toFixed(5)}`;
    if (lastStartKey.current === key) return;
    lastStartKey.current = key;
    cameraRef.current?.flyTo({ center: toLngLat(startPoint), zoom: 15, duration: 400 });
  }, [startPoint]);

  useEffect(() => {
    if (!livePosition) return;
    const key = `${livePosition.lat.toFixed(4)},${livePosition.lng.toFixed(4)}`;
    if (lastLiveKey.current === key) return;
    lastLiveKey.current = key;
    cameraRef.current?.flyTo({ center: toLngLat(livePosition), zoom: 16, duration: 600 });
  }, [livePosition]);

  useEffect(() => {
    if (route.length < 2) return;
    const lats = route.map(point => point.lat);
    const lngs = route.map(point => point.lng);
    cameraRef.current?.fitBounds(
      [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
      { padding: { top: 64, right: 48, bottom: 64, left: 48 }, duration: 400 }
    );
  }, [route]);

  const routeData = {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: route.map(toLngLat),
        },
      },
    ],
  };

  return (
    <MapLibreMap
      style={{ flex: 1 }}
      mapStyle={MAP_STYLE}
      onPress={event => onMapPress?.({ lat: event.nativeEvent.lngLat[1], lng: event.nativeEvent.lngLat[0] })}
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
        <GeoJSONSource id="route-source" data={routeData}>
          <Layer
            id="route-halo"
            type="line"
            source="route-source"
            paint={{ 'line-color': '#080808', 'line-width': 10, 'line-opacity': 0.45, 'line-blur': 1.2 }}
          />
          <Layer
            id="route-line"
            type="line"
            source="route-source"
            paint={{ 'line-color': '#D8FF39', 'line-width': 5, 'line-opacity': 0.98 }}
          />
        </GeoJSONSource>
      )}
      {startPoint && (
        <Marker id="start" lngLat={toLngLat(startPoint)} anchor="bottom">
          <View className="h-7 w-7 rounded-full border-[3px] border-white bg-lime shadow-lg" />
        </Marker>
      )}
      {livePosition && (
        <Marker id="live" lngLat={toLngLat(livePosition)} anchor="center">
          <View className="h-6 w-6 rounded-full border-[4px] border-white bg-orange" />
        </Marker>
      )}
    </MapLibreMap>
  );
}
