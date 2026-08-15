import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { RouteCard } from '@/components/RouteCard';
import { loadRoutes } from '@/lib/storage';
import { SavedRoute } from '@/lib/types';

export default function HomeScreen() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View className="flex-1 bg-stravaDark">
      <View className="p-4 border-b border-stravaBorder bg-stravaCard">
        <Text className="text-2xl font-display-extrabold text-white">Meine Routen</Text>
        <Text className="text-sm mt-1 text-stravaMuted">
          Gespeicherte Laufstrecken werden in der Supabase-Datenbank abgelegt.
        </Text>
        <Link href="/new-route" asChild>
          <Pressable className="mt-4 bg-strava rounded-xl py-3 items-center active:opacity-80">
            <Text className="text-white font-sans-bold text-base">Neue Route planen</Text>
          </Pressable>
        </Link>
      </View>

      {!loaded ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FC4C02" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-stravaMuted">{error}</Text>
        </View>
      ) : routes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-stravaMuted">
            Noch keine Routen gespeichert. Plane deine erste Laufstrecke über den Button oben.
          </Text>
        </View>
      ) : (
        <FlatList
          className="flex-1"
          contentContainerClassName="p-4 gap-3"
          data={routes}
          keyExtractor={r => r.id}
          renderItem={({ item }) => <RouteCard route={item} />}
        />
      )}
    </View>
  );
}