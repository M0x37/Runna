import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Map } from '@/components/Map/Map';
import { generateRoute } from '@/lib/routing';
import { useRouteStore } from '@/stores/useRouteStore';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function NewRouteScreen() {
  const draft = useRouteStore(s => s.draft);
  const setDraftStart = useRouteStore(s => s.setDraftStart);
  const setDraftKm = useRouteStore(s => s.setDraftKm);
  const setDraftCoords = useRouteStore(s => s.setDraftCoords);

  const [kmText, setKmText] = useState(String(draft.km).replace('.', ','));
  const [locating, setLocating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);

  async function useMyLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Keine Standortfreigabe',
          'Standortzugriff wurde verweigert. Suche deinen Ort per Adresse oder tippe auf die Karte.'
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setDraftStart({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setAccuracy(pos.coords.accuracy ?? null);
    } catch {
      Alert.alert(
        'Fehler',
        'Dein Standort konnte nicht ermittelt werden. Suche deinen Ort per Adresse oder tippe auf die Karte.'
      );
    } finally {
      setLocating(false);
    }
  }

  async function handleSearch() {
    const q = search.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=de&q=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error(`Nominatim Fehler: ${res.status}`);
      const data: NominatimResult[] = await res.json();
      setResults(data);
      if (data.length === 0) {
        Alert.alert('Nichts gefunden', `Zu „${q}" wurde keine Adresse gefunden.`);
      }
    } catch {
      Alert.alert('Fehler', 'Adresssuche fehlgeschlagen. Versuche es erneut.');
    } finally {
      setSearching(false);
    }
  }

  function pickResult(r: NominatimResult) {
    setDraftStart({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setAccuracy(null);
    setResults([]);
    setSearch('');
  }

  async function handleGenerate() {
    const start = draft.start;
    const km = parseFloat(kmText.replace(',', '.'));
    if (!start) {
      Alert.alert('Kein Startpunkt', 'Suche eine Adresse, tippe auf die Karte oder nutze deine Position.');
      return;
    }
    if (!Number.isFinite(km) || km <= 0) {
      Alert.alert('Keine Distanz', 'Bitte gib eine Distanz größer als 0 km ein.');
      return;
    }
    setGenerating(true);
    try {
      const coords = await generateRoute(start, km);
      setDraftKm(km);
      setDraftCoords(coords);
      router.push('/route/preview');
    } catch (e) {
      Alert.alert('Fehler', e instanceof Error ? e.message : 'Route konnte nicht generiert werden.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-stravaDark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1">
        <View className="flex-1 min-h-[200px]">
          <Map route={draft.coords} startPoint={draft.start} onMapPress={setDraftStart} />
        </View>

        <View className="p-4 border-t gap-3 bg-stravaCard border-stravaBorder">
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 border rounded-xl px-4 py-2.5 text-base border-stravaBorder bg-stravaDark text-white placeholder:text-stravaMuted"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              placeholder="Ort oder Adresse suchen (z. B. Dreikirchen)"
            />
            <Pressable
              className="rounded-xl px-4 py-2.5 items-center active:opacity-80 bg-gray-800"
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-sans-semibold">Suchen</Text>
              )}
            </Pressable>
          </View>

          {results.length > 0 && (
            <View className="gap-1">
              {results.map(r => (
                <Pressable
                  key={r.place_id}
                  className="rounded-lg px-3 py-2 active:opacity-70 bg-stravaDark"
                  onPress={() => pickResult(r)}
                >
                  <Text className="text-sm text-gray-200" numberOfLines={1}>
                    {r.display_name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text className="text-sm text-stravaMuted">
            {draft.start
              ? `Startpunkt: ${draft.start.lat.toFixed(5)}, ${draft.start.lng.toFixed(5)}` +
                (accuracy !== null
                  ? ` · Genauigkeit ±${Math.max(1, Math.round(accuracy))} m`
                  : '') +
                ' – tippe auf die Karte, um ihn zu ändern.'
              : 'Startpunkt wählen: Adresse suchen, auf die Karte tippen oder deine Position nutzen.'}
          </Text>

          <Pressable
            className="rounded-xl py-3 items-center active:opacity-80 bg-gray-800"
            onPress={useMyLocation}
            disabled={locating}
          >
            <Text className="font-sans-semibold text-white">
              {locating ? 'Position wird ermittelt…' : 'Aktuelle Position verwenden'}
            </Text>
          </Pressable>

          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 border rounded-xl px-4 py-3 text-base border-stravaBorder bg-stravaDark text-white placeholder:text-stravaMuted"
              value={kmText}
              onChangeText={setKmText}
              keyboardType="decimal-pad"
              placeholder="Distanz"
              inputMode="decimal"
            />
            <Text className="font-sans-medium text-stravaMuted">km</Text>
            <Pressable
              className="bg-strava rounded-xl px-6 py-3 items-center active:opacity-80"
              onPress={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-sans-bold text-base">Route generieren</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}