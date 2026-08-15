import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Map } from '@/components/Map/Map';
import { toGPX } from '@/lib/gpx';
import { generateRoute } from '@/lib/routing';
import { deleteRoute, loadRoutes, saveRoute } from '@/lib/storage';
import { LatLng, SavedRoute } from '@/lib/types';
import { useRouteStore } from '@/stores/useRouteStore';

const PREVIEW_ID = 'preview';

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function downloadGPX(route: SavedRoute) {
  const blob = new Blob([toGPX(route.coords)], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${route.name.replace(/\s+/g, '-').toLowerCase()}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}

function routeKm(coords: LatLng[]) {
  const R = 6_371_000;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1];
    const b = coords[i];
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const la1 = (a.lat * Math.PI) / 180;
    const la2 = (b.lat * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    total += 2 * R * Math.asin(Math.sqrt(h));
  }
  return total / 1000;
}

export default function RouteScreen() {
  const { id, seed } = useLocalSearchParams<{ id: string; seed?: string }>();
  const isPreview = id === PREVIEW_ID;
  const seedValue = parseInt(seed ?? '0', 10) || 0;

  const draft = useRouteStore(s => s.draft);
  const setDraftCoords = useRouteStore(s => s.setDraftCoords);
  const draftRef = useRef(draft);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const [route, setRoute] = useState<SavedRoute | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (isPreview) {
          const d = draftRef.current;
          if (!d.start || d.coords.length === 0) {
            router.replace('/new-route');
            return;
          }
          const preview: SavedRoute = {
            id: PREVIEW_ID,
            name: `Neue ${d.km.toLocaleString('de-DE', { maximumFractionDigits: 1 })}-km-Route`,
            distanceKm: routeKm(d.coords),
            createdAt: new Date().toISOString(),
            start: d.start,
            coords: d.coords,
          };
          if (active) {
            setName(preview.name);
            setRoute(preview);
          }
          return;
        }
        const all = await loadRoutes();
        const found = all.find(r => r.id === id);
        if (!active) return;
        if (found) setRoute(found);
        else setNotFound(true);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isPreview, id]);

  async function handleAnotherRoute() {
    if (!route) return;
    const d = draftRef.current;
    const start = d.start ?? route.start;
    const km = d.km || route.distanceKm;
    setGenerating(true);
    try {
      const coords = await generateRoute(start, km, seedValue + 1);
      setDraftCoords(coords);
      setRoute({ ...route, coords });
      router.setParams({ seed: String(seedValue + 1) });
    } catch (e) {
      Alert.alert('Fehler', e instanceof Error ? e.message : 'Route konnte nicht generiert werden.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!route) return;
    const saved: SavedRoute = {
      ...route,
      id: newId(),
      name: name.trim() || route.name,
      createdAt: new Date().toISOString(),
    };
    try {
      await saveRoute(saved);
      router.replace(`/route/${saved.id}`);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      Alert.alert('Speichern fehlgeschlagen', `Fehler: ${detail}`);
    }
  }

  function handleDelete() {
    if (!route) return;
    const doDelete = async () => {
      try {
        await deleteRoute(route.id);
        router.replace('/');
      } catch {
        Alert.alert('Fehler', 'Löschen fehlgeschlagen.');
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`„${route.name}" wirklich löschen?`)) doDelete();
      return;
    }
    Alert.alert('Route löschen?', `„${route.name}" wird dauerhaft gelöscht.`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: doDelete },
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stravaDark">
        <ActivityIndicator size="large" color="#FC4C02" />
      </View>
    );
  }

  if (notFound || !route) {
    return (
      <View className="flex-1 items-center justify-center px-8 gap-4 bg-stravaDark">
        <Text className="text-base text-center text-stravaMuted">Route nicht gefunden.</Text>
        <Link href="/" asChild>
          <Pressable className="bg-blue-600 rounded-xl px-6 py-3">
            <Text className="text-white font-semibold">Zur Übersicht</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stravaDark">
      <View className="flex-1 min-h-[200px]">
        <Map route={route.coords} startPoint={route.start} />
      </View>

      <View className="p-4 border-t gap-3 bg-stravaCard border-stravaBorder">
        {isPreview ? (
          <>
            <Text className="text-sm text-stravaMuted">
              Distanz: {route.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km
            </Text>
            <TextInput
              className="border rounded-xl px-4 py-3 text-base border-stravaBorder bg-stravaDark text-white placeholder:text-stravaMuted"
              value={name}
              onChangeText={setName}
              placeholder="Name der Route"
            />
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 rounded-xl py-3 items-center active:opacity-80 bg-gray-800"
                onPress={handleAnotherRoute}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#FC4C02" />
                ) : (
                  <Text className="text-strava font-sans-bold">Andere Route</Text>
                )}
              </Pressable>
              <Pressable
                className="flex-1 bg-strava rounded-xl py-3 items-center active:opacity-80"
                onPress={handleSave}
              >
                <Text className="text-white font-sans-bold">Speichern</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text className="text-xl font-display-extrabold text-white">{route.name}</Text>
            <Text className="text-sm text-stravaMuted">
              {route.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km ·{' '}
              {new Date(route.createdAt).toLocaleDateString('de-DE')}
            </Text>
            <View className="flex-row gap-3">
              {Platform.OS === 'web' && (
                <Pressable
                  className="flex-1 rounded-xl py-3 items-center active:opacity-80 bg-gray-800"
                  onPress={() => downloadGPX(route)}
                >
                  <Text className="text-strava font-sans-bold">GPX exportieren</Text>
                </Pressable>
              )}
              <Pressable
                className="flex-1 bg-red-600 rounded-xl py-3 items-center active:opacity-80"
                onPress={handleDelete}
              >
                <Text className="text-white font-sans-bold">Löschen</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
