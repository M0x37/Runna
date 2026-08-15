import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SavedRoute } from '@/lib/types';

export function RouteCard({ route }: { route: SavedRoute }) {
  return (
    <Link href={`/route/${route.id}`} asChild>
      <Pressable className="rounded-2xl p-4 shadow-sm border bg-stravaCard border-stravaBorder active:opacity-80">
        <Text className="text-lg font-display text-white">{route.name}</Text>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-sm font-sans-bold text-strava">
            {route.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km
          </Text>
          <Text className="text-xs text-stravaMuted">
            {new Date(route.createdAt).toLocaleDateString('de-DE')}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}