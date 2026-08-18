import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { ElevationChart } from '@/components/ElevationChart';
import { Map } from '@/components/Map/Map';
import { fetchElevation, ElevationProfile } from '@/lib/elevation';
import { distanceToRouteM } from '@/lib/geo';
import { toGPX } from '@/lib/gpx';
import { generateRoute } from '@/lib/routing';
import { deleteRoute, loadRoutes, saveRoute, toggleRouteFavorite } from '@/lib/storage';
import { LatLng, SavedRoute } from '@/lib/types';
import { useRouteStore } from '@/stores/useRouteStore';

const PREVIEW_ID = 'preview';
const ON_ROUTE_THRESHOLD_M = 30;

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function downloadGPX(route: SavedRoute) {
  const blob = new Blob([toGPX(route.coords)], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${route.name.replace(/\s+/g, '-').toLowerCase()}.gpx`;
  link.click();
  URL.revokeObjectURL(url);
}

function routeKm(coords: LatLng[]) {
  const earthRadiusM = 6_371_000;
  let total = 0;
  for (let index = 1; index < coords.length; index++) {
    const a = coords[index - 1];
    const b = coords[index];
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const latA = (a.lat * Math.PI) / 180;
    const latB = (b.lat * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) ** 2 + Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) ** 2;
    total += 2 * earthRadiusM * Math.asin(Math.sqrt(h));
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
  const [profile, setProfile] = useState<ElevationProfile | null>(null);
  const [elevationError, setElevationError] = useState(false);
  const [running, setRunning] = useState(false);
  const [livePosition, setLivePosition] = useState<LatLng | null>(null);
  const [deviationM, setDeviationM] = useState<number | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (isPreview) {
          const currentDraft = draftRef.current;
          if (!currentDraft.start || currentDraft.coords.length === 0) {
            router.replace('/new-route');
            return;
          }
          const preview: SavedRoute = {
            id: PREVIEW_ID,
            name: `Neue ${currentDraft.km.toLocaleString('de-DE', { maximumFractionDigits: 1 })}-km-Route`,
            distanceKm: routeKm(currentDraft.coords),
            createdAt: new Date().toISOString(),
            start: currentDraft.start,
            coords: currentDraft.coords,
          };
          if (active) {
            setName(preview.name);
            setRoute(preview);
          }
          return;
        }
        const all = await loadRoutes();
        const found = all.find(savedRoute => savedRoute.id === id);
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

  const routeId = route?.id ?? null;
  const routeCoords = route?.coords ?? null;

  useEffect(() => {
    if (!routeId || !routeCoords || isPreview) return;
    let active = true;
    fetchElevation(routeCoords)
      .then(nextProfile => active && setProfile(nextProfile))
      .catch(() => active && setElevationError(true));
    return () => {
      active = false;
    };
  }, [routeId, routeCoords, isPreview]);

  useEffect(() => {
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  async function startRun() {
    if (!route) return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Keine Standortfreigabe', 'Standortzugriff wird für den Live-Lauf-Modus benötigt.');
        return;
      }
      setRunning(true);
      setLivePosition(null);
      setDeviationM(null);
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 3 },
        position => {
          const point = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLivePosition(point);
          setDeviationM(Math.round(distanceToRouteM(point, route.coords)));
        }
      );
    } catch {
      Alert.alert('Fehler', 'GPS konnte nicht gestartet werden.');
    }
  }

  function stopRun() {
    watchRef.current?.remove();
    watchRef.current = null;
    setRunning(false);
    setLivePosition(null);
    setDeviationM(null);
  }

  async function handleAnotherRoute() {
    if (!route) return;
    const currentDraft = draftRef.current;
    const start = currentDraft.start ?? route.start;
    const km = currentDraft.km || route.distanceKm;
    setGenerating(true);
    try {
      const coords = await generateRoute(start, km, seedValue + 1);
      setDraftCoords(coords);
      setRoute({ ...route, coords, distanceKm: routeKm(coords) });
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

  async function handleToggleFavorite() {
    if (!route || isPreview) return;
    const nextFavorite = !route.favorite;
    try {
      await toggleRouteFavorite(route.id, nextFavorite);
      setRoute({ ...route, favorite: nextFavorite });
    } catch {
      Alert.alert('Fehler', 'Favorit konnte nicht gespeichert werden.');
    }
  }

  async function handleShare() {
    if (!route) return;
    const text = `${route.name} · ${route.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km · Start: ${route.start.lat.toFixed(5)}, ${route.start.lng.toFixed(5)}`;
    if (Platform.OS === 'web') {
      const file = new File([toGPX(route.coords)], `${route.name.replace(/\s+/g, '-').toLowerCase()}.gpx`, {
        type: 'application/gpx+xml',
      });
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: route.name });
          return;
        }
      } catch {
        // Web Share nicht unterstützt, Fallback folgt.
      }
      try {
        await navigator.share({ title: route.name, text });
        return;
      } catch {
        // Teilen abgebrochen oder nicht verfügbar, Fallback folgt.
      }
      await navigator.clipboard.writeText(text);
      Alert.alert('Kopiert', 'Routen-Infos in die Zwischenablage kopiert.');
    } else {
      await Share.share({ message: text });
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
      <View className="flex-1 items-center justify-center gap-3 bg-canvas">
        <ActivityIndicator size="large" color="#D8FF39" />
        <Text className="text-sm text-muted">Route wird vorbereitet</Text>
      </View>
    );
  }

  if (notFound || !route) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-canvas px-8">
        <Text className="text-center text-lg font-display text-white">Route nicht gefunden.</Text>
        <Text className="text-center text-sm leading-5 text-muted">Vielleicht wurde sie gelöscht oder ist nicht mehr verfügbar.</Text>
        <Link href="/" asChild>
          <Pressable className="mt-2 rounded-2xl bg-lime px-5 py-3.5 active:opacity-85">
            <Text className="font-sans-bold text-ink">Zur Übersicht</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  const onRoute = deviationM !== null && deviationM <= ON_ROUTE_THRESHOLD_M;
  const distanceLabel = route.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: 1 });
  const savedDate = new Date(route.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View className="flex-1 bg-canvas">
      <View className="flex-[0.78] min-h-[235px] bg-surface">
        <Map route={route.coords} startPoint={route.start} livePosition={livePosition ?? undefined} />
        <View className="absolute left-4 top-4 rounded-full border border-line bg-canvas/95 px-3 py-2">
          <Text className="text-[10px] tracking-[1.2px] font-sans-bold text-white">
            {isPreview ? 'ROUTENVORSCHLAG' : `${distanceLabel.toUpperCase()} KM`}
          </Text>
        </View>
        {running && (
          <View className="absolute right-4 top-4 rounded-full bg-lime px-3 py-2">
            <Text className="text-[10px] tracking-[1px] font-sans-bold text-ink">LIVE-LAUF</Text>
          </View>
        )}
      </View>

      <ScrollView
        className="-mt-6 flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="min-h-full rounded-t-[32px] border-t border-line bg-canvas px-5 pb-8 pt-5">
          <View className="self-center h-1.5 w-10 rounded-full bg-surface-soft" />

          {isPreview ? (
            <>
              <View className="mt-5 flex-row items-center justify-between">
                <Text className="text-[10px] tracking-[1.8px] font-sans-bold text-muted">DEINE NEUE RUNDE</Text>
                <Text className="text-xs font-sans-semibold text-lime">VORSCHAU</Text>
              </View>
              <View className="mt-2 flex-row items-end gap-2">
                <Text className="text-[42px] leading-[48px] font-display-extrabold text-white">{distanceLabel}</Text>
                <Text className="mb-2 text-base font-sans-bold text-muted">KM</Text>
              </View>
              <Text className="mt-2 text-sm leading-5 text-muted">
                Sieh dir die Strecke an. Du kannst eine Alternative erzeugen oder sie direkt für später sichern.
              </Text>

              <View className="mt-5 rounded-2xl border border-line bg-surface px-4 py-2">
                <Text className="pt-1 text-[10px] tracking-[1.4px] font-sans-bold text-faint">NAME DER ROUTE</Text>
                <TextInput
                  className="py-2 text-lg font-display text-white"
                  value={name}
                  onChangeText={setName}
                  placeholder="Zum Beispiel Feierabendrunde"
                  placeholderTextColor="#6E6E74"
                  accessibilityLabel="Name der Route"
                />
              </View>

              <Pressable
                className="mt-3 items-center rounded-2xl border border-line bg-surface py-4 active:opacity-75"
                onPress={handleAnotherRoute}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#D8FF39" />
                ) : (
                  <Text className="font-sans-bold text-white">Neue Variante erstellen</Text>
                )}
              </Pressable>
              <Pressable
                className="mt-3 items-center rounded-2xl bg-lime py-4 active:opacity-85"
                onPress={handleSave}
              >
                <Text className="text-[15px] font-sans-bold text-ink">Route speichern →</Text>
              </Pressable>
            </>
          ) : (
            <>
              {running && (
                <View className={`mt-5 flex-row items-center gap-3 rounded-2xl border px-4 py-3 ${onRoute ? 'border-success/40 bg-success/10' : 'border-orange/40 bg-orange/10'}`}>
                  <View className={`h-2.5 w-2.5 rounded-full ${onRoute ? 'bg-success' : 'bg-orange'}`} />
                  <View className="flex-1">
                    <Text className="text-sm font-sans-bold text-white">
                      {onRoute ? 'Du bist auf der Route' : deviationM !== null ? `${deviationM} m neben der Route` : 'GPS wird verbunden'}
                    </Text>
                    <Text className="mt-0.5 text-xs text-muted">
                      {onRoute ? 'Weiter so — deine Position wird live verfolgt.' : 'Die Karte führt dich zurück auf deine Strecke.'}
                    </Text>
                  </View>
                </View>
              )}

              <View className="mt-5 flex-row items-start gap-3">
                <View className="flex-1">
                  <Text className="text-[10px] tracking-[1.7px] font-sans-bold text-muted">GESPEICHERTE ROUTE</Text>
                  <Text className="mt-2 text-3xl leading-9 font-display text-white">{route.name}</Text>
                </View>
                <Pressable
                  onPress={handleToggleFavorite}
                  hitSlop={10}
                  className={`mt-3 h-11 w-11 items-center justify-center rounded-2xl border active:opacity-70 ${route.favorite ? 'border-lime bg-lime' : 'border-line bg-surface'}`}
                  accessibilityLabel={route.favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                >
                  <Text className={`text-xl ${route.favorite ? 'text-ink' : 'text-muted'}`}>{route.favorite ? '★' : '☆'}</Text>
                </Pressable>
              </View>

              <View className="mt-5 flex-row gap-3">
                <View className="flex-1 rounded-2xl border border-line bg-surface p-4">
                  <Text className="text-[10px] tracking-[1.2px] font-sans-bold text-faint">DISTANZ</Text>
                  <Text className="mt-1 text-2xl font-display text-white">{distanceLabel} km</Text>
                </View>
                <View className="flex-1 rounded-2xl border border-line bg-surface p-4">
                  <Text className="text-[10px] tracking-[1.2px] font-sans-bold text-faint">GESPEICHERT</Text>
                  <Text className="mt-1 text-sm font-sans-semibold text-white">{savedDate}</Text>
                </View>
              </View>

              <View className="mt-3">
                {profile && <ElevationChart profile={profile} />}
                {elevationError && (
                  <View className="rounded-2xl border border-line bg-surface px-4 py-3">
                    <Text className="text-sm text-muted">Das Höhenprofil ist gerade nicht verfügbar.</Text>
                  </View>
                )}
              </View>

              <Pressable
                className={`mt-5 items-center rounded-2xl py-4 active:opacity-85 ${running ? 'bg-danger' : 'bg-lime'}`}
                onPress={running ? stopRun : startRun}
              >
                <Text className={`text-[15px] font-sans-bold ${running ? 'text-white' : 'text-ink'}`}>
                  {running ? 'Lauf beenden' : 'Lauf starten →'}
                </Text>
              </Pressable>

              <View className="mt-3 flex-row gap-3">
                <Pressable
                  className="flex-1 items-center rounded-2xl border border-line bg-surface py-3.5 active:opacity-75"
                  onPress={handleShare}
                >
                  <Text className="text-sm font-sans-bold text-white">Teilen</Text>
                </Pressable>
                {Platform.OS === 'web' && (
                  <Pressable
                    className="flex-1 items-center rounded-2xl border border-line bg-surface py-3.5 active:opacity-75"
                    onPress={() => downloadGPX(route)}
                  >
                    <Text className="text-sm font-sans-bold text-white">GPX laden</Text>
                  </Pressable>
                )}
              </View>

              <Pressable className="mt-5 items-center py-2 active:opacity-70" onPress={handleDelete}>
                <Text className="text-sm font-sans-semibold text-danger">Route löschen</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
