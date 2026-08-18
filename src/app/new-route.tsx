import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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

const DISTANCE_PRESETS = ['3', '5', '8', '10'];

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
      if (data.length === 0) Alert.alert('Nichts gefunden', `Zu „${q}" wurde keine Adresse gefunden.`);
    } catch {
      Alert.alert('Fehler', 'Adresssuche fehlgeschlagen. Versuche es erneut.');
    } finally {
      setSearching(false);
    }
  }

  function pickResult(result: NominatimResult) {
    setDraftStart({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
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

  const startLabel = draft.start
    ? `Startpunkt gesetzt${accuracy !== null ? ` · ±${Math.max(1, Math.round(accuracy))} m` : ''}`
    : 'Startpunkt noch wählen';

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1">
        <View className="flex-1 bg-surface">
          <Map route={draft.coords} startPoint={draft.start} onMapPress={setDraftStart} />
          <View className="absolute left-4 right-4 top-4 rounded-2xl border border-line bg-canvas/95 px-4 py-3">
            <Text className="text-[10px] tracking-[1.6px] font-sans-bold text-muted">ROUTENPLANER</Text>
            <Text className="mt-1 text-sm font-sans-semibold text-white">Tippe auf die Karte, um einen Startpunkt zu setzen.</Text>
          </View>
        </View>

        <View className="-mt-6 max-h-[68%] rounded-t-[32px] border-t border-line bg-canvas">
          <ScrollView
            contentContainerClassName="px-5 pb-7 pt-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="self-center h-1.5 w-10 rounded-full bg-surface-soft" />
            <View className="mt-5 flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-2xl font-display text-white">Plane deine Runde</Text>
                <Text className="mt-1 text-sm leading-5 text-muted">
                  Wähle einen Startpunkt und die Strecke, die heute zu dir passt.
                </Text>
              </View>
              <View className={`mt-1 rounded-full px-3 py-1.5 ${draft.start ? 'bg-lime' : 'bg-surface-soft'}`}>
                <Text className={`text-[10px] tracking-[1px] font-sans-bold ${draft.start ? 'text-ink' : 'text-muted'}`}>
                  {draft.start ? 'BEREIT' : 'SCHRITT 1'}
                </Text>
              </View>
            </View>

            <View className="mt-5 rounded-2xl border border-line bg-surface p-3">
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="flex-1 px-2 py-2.5 text-[15px] text-white"
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  placeholder="Ort oder Adresse suchen"
                  placeholderTextColor="#6E6E74"
                  accessibilityLabel="Ort oder Adresse suchen"
                />
                <Pressable
                  className="rounded-xl bg-surface-soft px-4 py-2.5 active:opacity-75"
                  onPress={handleSearch}
                  disabled={searching}
                >
                  {searching ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-sans-bold text-white">Suchen</Text>}
                </Pressable>
              </View>
              {results.length > 0 && (
                <View className="mt-2 border-t border-line pt-2">
                  {results.map(result => (
                    <Pressable
                      key={result.place_id}
                      className="rounded-xl px-3 py-3 active:bg-surface-soft"
                      onPress={() => pickResult(result)}
                    >
                      <Text className="text-sm leading-5 text-white" numberOfLines={2}>
                        {result.display_name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View className="mt-3 flex-row items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-sans-semibold text-white">{startLabel}</Text>
                <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
                  {draft.start
                    ? `${draft.start.lat.toFixed(5)}, ${draft.start.lng.toFixed(5)}`
                    : 'Adresse suchen, Karte antippen oder Standort verwenden.'}
                </Text>
              </View>
              <Pressable
                className="rounded-xl bg-surface-soft px-3 py-2 active:opacity-75"
                onPress={useMyLocation}
                disabled={locating}
              >
                {locating ? <ActivityIndicator color="#D8FF39" /> : <Text className="text-xs font-sans-bold text-lime">Mein Standort</Text>}
              </Pressable>
            </View>

            <View className="mt-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-sans-semibold text-white">Wie weit möchtest du laufen?</Text>
                <Text className="text-xs text-muted">Schritt 2</Text>
              </View>
              <View className="mt-3 flex-row gap-2">
                {DISTANCE_PRESETS.map(preset => {
                  const active = kmText.replace(',', '.') === preset;
                  return (
                    <Pressable
                      key={preset}
                      className={`flex-1 items-center rounded-xl border py-3 active:opacity-75 ${active ? 'border-lime bg-lime' : 'border-line bg-surface'}`}
                      onPress={() => setKmText(preset)}
                    >
                      <Text className={`text-sm font-sans-bold ${active ? 'text-ink' : 'text-white'}`}>{preset} km</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View className="mt-3 flex-row items-center rounded-2xl border border-line bg-surface px-4">
                <Text className="text-[10px] tracking-[1.4px] font-sans-bold text-faint">EIGENE DISTANZ</Text>
                <TextInput
                  className="flex-1 px-3 py-4 text-lg font-display text-white"
                  value={kmText}
                  onChangeText={setKmText}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  placeholder="5"
                  placeholderTextColor="#6E6E74"
                  accessibilityLabel="Eigene Distanz in Kilometern"
                />
                <Text className="text-sm font-sans-semibold text-muted">km</Text>
              </View>
            </View>

            <Pressable
              className={`mt-5 items-center rounded-2xl py-4 active:opacity-85 ${draft.start ? 'bg-lime' : 'bg-surface-soft'}`}
              onPress={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#080808" />
              ) : (
                <Text className={`text-[15px] font-sans-bold ${draft.start ? 'text-ink' : 'text-faint'}`}>
                  Route erstellen →
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
