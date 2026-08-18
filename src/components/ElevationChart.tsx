import { Text, View } from 'react-native';
import { ElevationProfile } from '@/lib/elevation';

const BAR_COUNT = 40;

export function ElevationChart({ profile }: { profile: ElevationProfile }) {
  const { elevations, min, max, ascent } = profile;
  const span = Math.max(1, max - min);
  const bars = downsample(elevations, BAR_COUNT);

  return (
    <View className="rounded-2xl border border-line bg-surface p-4">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[10px] tracking-[1.5px] font-sans-bold text-faint">HÖHENPROFIL</Text>
          <Text className="mt-1 text-sm font-sans-semibold text-white">+{ascent} m Anstieg</Text>
        </View>
        <Text className="pt-1 text-xs text-muted">
          {min.toFixed(0)}–{max.toFixed(0)} m
        </Text>
      </View>
      <View className="mt-4 flex-row items-end h-20 gap-[2px]">
        {bars.map((heightValue, index) => {
          const relative = (heightValue - min) / span;
          const height = Math.max(3, Math.round(relative * 72));
          return (
            <View
              key={index}
              className="flex-1 rounded-sm bg-lime"
              style={{ height, opacity: 0.22 + 0.78 * relative }}
            />
          );
        })}
      </View>
      <View className="mt-2 flex-row justify-between">
        <Text className="text-[10px] text-faint">START</Text>
        <Text className="text-[10px] text-faint">ZIEL</Text>
      </View>
    </View>
  );
}

function downsample(values: number[], max: number): number[] {
  if (values.length <= max) return values;
  const step = (values.length - 1) / (max - 1);
  const out: number[] = [];
  for (let i = 0; i < max; i++) out.push(values[Math.round(i * step)]);
  return out;
}
