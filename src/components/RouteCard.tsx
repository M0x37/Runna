import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SavedRoute } from '@/lib/types';

export function RouteCard({ route }: { route: SavedRoute }) {
  const date = new Date(route.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link href={`/route/${route.id}`} asChild>
      <Pressable className="mx-5 overflow-hidden rounded-[24px] border border-line bg-surface p-4 active:opacity-80">
        <View className="flex-row items-start justify-between gap-4">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-surface-soft">
            <Text className="text-[10px] tracking-[1.2px] font-sans-bold text-lime">RUN</Text>
          </View>
          <View className="flex-row items-center gap-3">
            {route.favorite && (
              <View className="rounded-full bg-lime px-2.5 py-1">
                <Text className="text-[10px] tracking-[1px] font-sans-bold text-ink">FAVORIT</Text>
              </View>
            )}
            <Text className="pt-1 text-lg text-muted">→</Text>
          </View>
        </View>

        <Text className="mt-4 text-xl leading-6 font-display text-white" numberOfLines={2}>
          {route.name}
        </Text>

        <View className="mt-4 flex-row items-center justify-between border-t border-line pt-3">
          <View className="rounded-full bg-lime px-3 py-1.5">
            <Text className="text-sm font-sans-bold text-ink">
              {route.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km
            </Text>
          </View>
          <Text className="text-xs font-sans-medium text-muted">Gespeichert am {date}</Text>
        </View>
      </Pressable>
    </Link>
  );
}
