# Runna – Laufstrecken-Planer

Single-User-App zum Planen von Laufstrecken: Startpunkt + Distanz eingeben, die App
generiert über die [openrouteservice](https://openrouteservice.org)-API (`foot-walking`,
`round_trip`) eine Rundstrecke, die nur für Fußgänger geeignete Wege nutzt. Die Route wird
auf einer Karte angezeigt und lokal gespeichert.

Läuft aus **einer** Expo-Codebasis als Website (PC) und als Android-APK.

## Kosten

**Alles für immer kostenlos – kein Abo, kein API-Key, keine Kreditkarte:**

| Komponente | Lösung | Kosten |
|---|---|---|
| Routen-Generierung | openrouteservice (kostenloser Account) | gratis, Tageslimit |
| Karte Android | MapLibre (Open-Source, BSD) + OpenFreeMap-Kacheln | gratis |
| Karte Web | Leaflet + OpenStreetMap | gratis |
| Speicherung | Supabase (kostenloser Plan: 500 MB DB) | gratis, keine Kreditkarte |

## Setup

```bash
npm install
cp .env.example .env   # ORS-Key + Supabase-Zugangsdaten eintragen
```

| Variable | Zweck | Bezugsquelle |
|---|---|---|
| `EXPO_PUBLIC_ORS_KEY` | openrouteservice-Routen (Round-Trip) | https://openrouteservice.org/dev/dashboard/ (kostenlos) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL | Supabase-Dashboard → Project Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase-Anon-Key | Supabase-Dashboard → Project Settings → API |

### Supabase einrichten

1. Konto auf https://supabase.com erstellen (kostenlos, keine Kreditkarte) → **New project**.
2. In Project Settings → **API** die `Project URL` und den `anon public`-Key in die `.env` eintragen.
3. Im **SQL Editor** den Inhalt von `supabase/schema.sql` ausführen (legt die Tabelle `routes`
   samt Zugriffsregeln an).

Ohne `EXPO_PUBLIC_ORS_KEY` zeigt die App eine verständliche Fehlermeldung.
Für die Karten selbst wird kein Key benötigt.

## Entwicklung

```bash
npm run web        # Web (Metro, http://localhost:8081)
npx expo start     # Android im Dev-Build (siehe unten; Expo Go funktioniert NICHT, s. Hinweis)
npm run typecheck
npm run lint
```

## Karten-Plattform-Split

Metro lädt je Plattform automatisch:

- `src/components/Map/Map.native.tsx` – MapLibre + OpenFreeMap (iOS/Android)
- `src/components/Map/Map.web.tsx` – `react-leaflet` + OpenStreetMap (Browser)

Import bleibt überall gleich: `import { Map } from '@/components/Map/Map'`.

## Builds

```bash
# Android-APK (Preview-Profil, lokal herunterladbar) – enthält die Karte
npm run build:android        # entspricht: eas build -p android --profile preview

# Website (statischer Export nach dist/, z. B. auf Vercel/Netlify hosten)
npm run export:web           # entspricht: npx expo export -p web
```

Für den Android-Build wird ein EAS-Account benötigt (`npx eas-cli login`).

## Hinweise

- **Kein Expo Go:** MapLibre ist ein nativer Modul und läuft nicht in Expo Go –
  getestet wird über einen Development Build (`eas build --profile development`)
  oder direkt das Preview-APK.
- Kein Login, kein Live-Tracking: Routen liegen in einer Supabase-Datenbank (kostenloser
  Plan). Für eine rein private App reicht das; bei öffentlicher Verteilung besser Login +
  Row-Level-Security ergänzen (Schema dafür in `supabase/schema.sql` vorbereitet).
- Der openrouteservice-Key liegt im Client – für eine rein private App okay; für
  öffentliche Verteilung besser über eine Serverless-Function proxyen (siehe plan.md).
- GPX-Export ist bewusst nur im Web verfügbar (Download in Strava/Garmin importierbar).

## Struktur

```
src/
  app/
    index.tsx              # Liste gespeicherter Routen
    new-route.tsx          # Startpunkt wählen + km eingeben + generieren
    route/[id].tsx         # Kartenansicht, speichern/löschen/neu generieren, GPX-Export (Web)
  components/
    Map/                   # Plattform-Split (native/web)
    RouteCard.tsx
  lib/
    routing.ts             # openrouteservice-Anbindung
    storage.ts             # Supabase-Helper (Tabelle 'routes')
    gpx.ts                 # GPX-Export
  stores/
    useRouteStore.ts       # Zustand (Draft der zu generierenden Route)
```