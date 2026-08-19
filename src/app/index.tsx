import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Link, router, useFocusEffect } from 'expo-router';
import { RouteCard } from '@/components/RouteCard';
import { generateRoute } from '@/lib/routing';
import { loadRoutes } from '@/lib/storage';
import { LatLng, SavedRoute } from '@/lib/types';
import { useRouteStore } from '@/stores/useRouteStore';

export default function HomeScreen() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickKm, setQuickKm] = useState('5');
  const [quickGenerating, setQuickGenerating] = useState(false);
  const [quickStart, setQuickStart] = useState<LatLng | null>(null);

  const setDraftStart = useRouteStore(s => s.setDraftStart);
  const setDraftKm = useRouteStore(s => s.setDraftKm);
  const setDraftCoords = useRouteStore(s => s.setDraftCoords);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadRoutes()
        .then(list => active && setRoutes(list))
        .catch(e => {
          if (!active) return;
          setError(e instanceof Error ? e.message : 'Routen konnten nicht geladen werden.');
          setRoutes([]);
        })
        .finally(() => active && setLoaded(true));
      return () => {
        active = false;
      };
    }, [])
  );

  async function handleQuickStart() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Keine Standortfreigabe',
          'Für den Schnellstart wird dein aktueller Standort benötigt.'
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setQuickStart({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      Alert.alert('Fehler', 'Standort konnte nicht ermittelt werden.');
    }
  }

  async function handleQuickGenerate() {
    if (!quickStart) return;
    const km = parseFloat(quickKm.replace(',', '.'));
    if (!km || km <= 0 || km > 100) {
      Alert.alert('Ungültige Distanz', 'Bitte eine Distanz zwischen 1 und 100 km eingeben.');
      return;
    }
    setQuickGenerating(true);
    try {
      setDraftStart(quickStart);
      setDraftKm(km);
      const coords = await generateRoute(quickStart, km);
      setDraftCoords(coords);
      router.push('/route/preview');
    } catch (e) {
      Alert.alert('Fehler', e instanceof Error ? e.message : 'Route konnte nicht generiert werden.');
    } finally {
      setQuickGenerating(false);
    }
  }

  const header = (
    <View className="px-5 pt-3 pb-7">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm tracking-[4px] font-display text-white">RUNNA</Text>
        <View className="rounded-full border border-line bg-surface px-3 py-1.5">
          <Text className="text-[10px] tracking-[1.5px] font-sans-bold text-muted">DEINE ROUTEN</Text>
        </View>
      </View>

      <View className="mt-8">
        <Text className="text-4xl leading-[43px] font-display-extrabold text-white">
          Lauf einfach{`\n`}los.
        </Text>
      </View>

      <View className="mt-7 rounded-[28px] border border-line bg-surface-raised p-5">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-lime" />
          <Text className="text-[11px] tracking-[1.8px] font-sans-bold text-muted">SCHNELLSTART</Text>
        </View>
        <Text className="mt-3 text-2xl leading-7 font-display text-white">Deine nächste Runde.</Text>

        {!quickStart ? (
          <Pressable
            className="mt-5 flex-row items-center justify-between rounded-2xl bg-lime px-5 py-4 active:opacity-85"
            onPress={handleQuickStart}
          >
            <Text className="text-[15px] font-sans-bold text-ink">Standort verwenden</Text>
            <Text className="text-xl font-sans-bold text-ink">→</Text>
          </Pressable>
        ) : (
          <View className="mt-5 gap-3">
            <View className="flex-row items-center justify-between rounded-2xl border border-line bg-canvas px-4 py-3">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-success" />
                <Text className="text-sm font-sans-semibold text-white">Startpunkt bereit</Text>
              </View>
              <Pressable onPress={() => setQuickStart(null)} hitSlop={10}>
                <Text className="text-xs font-sans-semibold text-muted">Ändern</Text>
              </Pressable>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-line bg-canvas px-4 py-1">
                <Text className="pt-2 text-[10px] tracking-[1.3px] font-sans-bold text-faint">DISTANZ</Text>
                <TextInput
                  className="py-1 text-xl font-display text-white"
                  value={quickKm}
                  onChangeText={setQuickKm}
                  keyboardType="numeric"
                  inputMode="decimal"
                  placeholder="5"
                  placeholderTextColor="#7593A0"
                  accessibilityLabel="Distanz in Kilometern"
                />
                <Text className="pb-2 text-xs text-muted">Kilometer</Text>
              </View>
              <Pressable
                className="items-center justify-center rounded-2xl bg-lime px-5 active:opacity-85"
                onPress={handleQuickGenerate}
                disabled={quickGenerating}
                accessibilityLabel="Route generieren"
              >
                {quickGenerating ? (
                  <ActivityIndicator color="#071A2C" />
                ) : (
                  <>
                    <Text className="text-lg font-display text-ink">Los</Text>
                    <Text className="mt-0.5 text-sm text-ink">→</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}

        <Link href="/new-route" asChild>
          <Pressable className="mt-3 items-center rounded-2xl border border-line py-3.5 active:opacity-75">
            <Text className="text-sm font-sans-semibold text-white">Route individuell planen</Text>
          </Pressable>
        </Link>
      </View>

      <View className="mt-7 flex-row items-end justify-between">
        <View>
          <Text className="text-2xl font-display text-white">Meine Routen</Text>
        </View>
        {loaded && <Text className="text-sm font-sans-bold text-lime">{routes.length}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      {!loaded ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#D8FF39" />
          <Text className="text-sm text-muted">Routen werden geladen</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base leading-6 text-muted">{error}</Text>
        </View>
      ) : (
        <FlatList
          className="flex-1"
          contentContainerClassName="pb-10"
          data={routes}
          keyExtractor={r => r.id}
          renderItem={({ item }) => <RouteCard route={item} />}
          ListHeaderComponent={header}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={
            <View className="mx-5 rounded-[24px] border border-dashed border-line bg-surface p-6">
              <Text className="text-lg font-display text-white">Noch keine Routen.</Text>
              <Text className="mt-2 text-sm leading-5 text-muted">Plane deine erste Runde.</Text>
            </View>
          }
          ListFooterComponent={
            routes.length > 0 ? (
              <Text className="mt-6 px-5 text-center text-xs leading-5 text-faint">
                Deine Routen bleiben für deinen nächsten Lauf jederzeit griffbereit.
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
