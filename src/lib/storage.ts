import { supabase, isSupabaseConfigured } from './supabase';
import { LatLng, SavedRoute } from './types';

interface RouteRow {
  id: string;
  name: string;
  distance_km: number;
  start_lat: number;
  start_lng: number;
  coords: LatLng[];
  created_at: string;
}

function notConfigured(): never {
  throw new Error(
    'Supabase ist nicht konfiguriert. Lege EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY in der .env-Datei fest.'
  );
}

function toRoute(row: RouteRow): SavedRoute {
  return {
    id: row.id,
    name: row.name,
    distanceKm: row.distance_km,
    createdAt: row.created_at,
    start: { lat: row.start_lat, lng: row.start_lng },
    coords: row.coords,
  };
}

export async function loadRoutes(): Promise<SavedRoute[]> {
  if (!isSupabaseConfigured) notConfigured();
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Supabase Fehler: ${error.message}`);
  return (data ?? []).map(toRoute);
}

export async function saveRoute(route: SavedRoute) {
  if (!isSupabaseConfigured) notConfigured();
  const { error } = await supabase.from('routes').insert({
    id: route.id,
    name: route.name,
    distance_km: route.distanceKm,
    start_lat: route.start.lat,
    start_lng: route.start.lng,
    coords: route.coords,
    created_at: route.createdAt,
  });
  if (error) throw new Error(`Supabase Fehler: ${error.message}`);
}

export async function deleteRoute(id: string) {
  if (!isSupabaseConfigured) notConfigured();
  const { error } = await supabase.from('routes').delete().eq('id', id);
  if (error) throw new Error(`Supabase Fehler: ${error.message}`);
}