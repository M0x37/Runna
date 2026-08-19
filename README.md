# Runna

Runna ist eine persönliche Laufstrecken-App für Android und Web. Du kannst Runden planen, auf einer Karte ansehen, speichern und später wieder öffnen. Die App ist für eine eigene Installation mit einem eigenen Supabase-Projekt ausgelegt.

## Funktionen

- Laufstrecken über Startpunkt und Distanz planen
- Kartenansicht für Web und Android
- Routen speichern, favorisieren und wieder öffnen
- GPS-gestützter Schnellstart und Live-Laufmodus
- GPX-Export und Teilen von Routen
- Höhenprofil für geplante Strecken
- Optionale Fehlerberichte über Sentry

## Technische Basis

| Bereich | Technologie |
|---|---|
| App | Expo, React Native und Expo Router |
| Web | React Native Web und Leaflet |
| Android-Karte | MapLibre |
| Datenbank | Supabase |
| Routing | openrouteservice |
| Fehlerberichte | Sentry (optional) |

## Voraussetzungen

Installiere eine aktuelle Node.js-LTS-Version, npm sowie Git. Für Android-Builds wird zusätzlich ein Expo-/EAS-Konto benötigt.

## Lokale Einrichtung

```bash
git clone https://github.com/M0x37/Runna.git
cd Runna
npm install
cp .env.example .env
```

Trage anschließend deine eigenen Werte in `.env` ein:

| Variable | Zweck |
|---|---|
| `EXPO_PUBLIC_ORS_KEY` | API-Key für die Streckenberechnung über openrouteservice |
| `EXPO_PUBLIC_SUPABASE_URL` | URL deines Supabase-Projekts |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Öffentlicher Publishable-/Anon-Key deines Supabase-Projekts |
| `EXPO_PUBLIC_SENTRY_DSN` | Optionaler DSN für Fehlerberichte |

> **Wichtig:** Committe niemals `.env`, Service-Role-Keys, Datenbankpasswörter, private Schlüssel oder `SENTRY_AUTH_TOKEN`. Werte mit dem Präfix `EXPO_PUBLIC_` sind im Client-Build sichtbar und dürfen deshalb nur öffentliche Client-Konfiguration enthalten.

## Supabase einrichten

1. Erstelle ein eigenes Supabase-Projekt.
2. Führe den Inhalt von `supabase/schema.sql` im Supabase SQL Editor aus.
3. Bei einer bestehenden Installation führst du zusätzlich `supabase/migration-favorite.sql` aus.
4. Übernimm die Projekt-URL und den öffentlichen Publishable-/Anon-Key in deine lokale `.env`.

## Entwicklung

```bash
npm run web         # Web-Vorschau unter http://localhost:8081
npm run android     # Android-Entwicklung über Expo
npm run typecheck   # TypeScript-Prüfung
npm run lint        # ESLint-Prüfung
```

## Builds

```bash
npm run build:android  # Android-APK über das EAS-Profil "preview"
npm run export:web     # Statischer Web-Export nach dist/
```

Für EAS-Builds speicherst du `SENTRY_AUTH_TOKEN` ausschließlich als geheime EAS-Umgebungsvariable. Der Token gehört weder in dieses Repository noch in eine lokale Datei, die committed wird.

## Projektstruktur

```text
src/
  app/                 Expo-Router-Seiten
  components/          Wiederverwendbare UI- und Kartenkomponenten
  lib/                 Supabase-, Routing-, GPS- und GPX-Helfer
  stores/              Lokaler Routenstatus
supabase/              Datenbankschema und Migrationen
assets/                App-Icons und grafische Ressourcen
```

## Veröffentlichungshinweise

Dieses Repository enthält bewusst keine Zugangsdaten und keine produktive Datenbank. Wenn du deine eigene Version verteilst, überprüfe die Supabase-Richtlinien und den Schutz deiner Routing-API-Zugangsdaten. Für eine Mehrbenutzer-App solltest du Authentifizierung und restriktive Row-Level-Security ergänzen.
