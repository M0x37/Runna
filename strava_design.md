# Strava-Design der Laufstrecken-App

Design-Referenz: Wie die App aussieht und welche Farben wofür verwendet werden. (Keine technische/Code-Dokumentation.)

## Design-Philosophie

- Vorbild: Strava – sportlich, kontrastreich, aufgeräumt.
- **Ein Akzent: Orange.** Alle Hauptaktionen (Call-to-Action) sind orange, alles andere bleibt bewusst dezent (Weiß, Hellgrau, Dunkelgrau).
- **Ein dunkler Kontrast: Fast-Schwarz (#141414)** für Kopfzeilen und sekundäre Aktionen.
- Leichtes Grau als App-Hintergrund, weiße Karten schweben darauf.
- Runde Ecken (12–16 px) bei Buttons und Karten.
- **Zwei Schriftfamilien:** Archivo (sportlich, für Titel) und Inter (neutral, für Text und Buttons).
- **Nur Dark Mode:** Die App ist ausschließlich dunkel gestaltet (kein heller Modus, kein Umschalter).

## Farbpalette (Standard = Dark Mode)

Die App ist **ausschließlich dunkel** gestaltet – es gibt keinen hellen Modus.

| Name | Hex | Verwendung |
|---|---|---|
| Strava-Orange | `#FC4C02` | Primärfarbe: Haupt-Buttons, Routenlinie auf der Karte, Ladeindikatoren, Distanz-Anzeigen, Links/Aktionstexte |
| App-Hintergrund | `#141414` | gesamter App-Hintergrund |
| Karten-Hintergrund | `#1E1E1E` | Karten, Bedienflächen, Eingabefelder |
| Rahmen | `#333333` | Trennlinien und Kartenränder |
| Text Primär | `#FFFFFF` | Titel und Überschriften |
| Text Sekundär | `#A1A1A1` | Beschreibungen, Datum, Platzhalter |
| Sekundär-Button | `#1F2937` (gray-800) | neutrale und dunkle Buttons |
| Kopfzeile | `#000000` | Header, rein schwarz |
| Löschen/Gefahr | `#DC2626` | Lösch-Buttons |

Hinweis: Orange und Rot bleiben überall identisch; die Kartenkacheln bleiben hell (Karteninhalt), nur die App-Oberfläche ist dunkel.

## Komponenten

### Kopfzeile (Header, alle Screens)
- Hintergrund: **Schwarz `#000000`**, Text **Weiß**, Archivo Bold.
- Zurück-Pfeil: weiß, minimal (ohne Beschriftung).
- Statusleiste: hell (weiße Inhalte auf dunklem Grund).

### Haupt-Button (primäre Aktion)
- Hintergrund: **Strava-Orange `#FC4C02`**, Text **Weiß**, fett.
- Rundung: 12 px (`rounded-xl`), Innenabstand vertikal 12 px.
- Beim Drücken: auf 80 % Deckkraft (`active:opacity-80`).
- Während des Ladens: weißer Ladeindikator im Button.
- Beispiele: „Neue Route planen", „Route generieren", „Speichern".

### Dunkler Button (sekundäre Aktion, Suche)
- Hintergrund: **Strava-Dunkel `#141414`**, Text **Weiß**, halbfett.
- Gleiche Rundung und Druck-Zustand wie Haupt-Button.
- Beispiel: „Suchen" (Adresssuche).

### Neutraler Button (tertiäre Aktion)
- Hintergrund: **Hellgrau `#F3F4F6`**, Text **Strava-Orange `#FC4C02`**, fett (oder Dunkel für „Aktuelle Position").
- Rundung 12 px.
- Beispiele: „Andere Route", „GPX exportieren", „Aktuelle Position verwenden".

### Lösch-Button
- Hintergrund: **Rot `#DC2626`**, Text **Weiß**, fett.
- Beispiel: „Löschen".

### Routen-Karte (RouteCard, Übersichtsliste)
- Hintergrund **Weiß**, Rundung 16 px (`rounded-2xl`), leichter Schatten, dünner Rahmen `#F3F4F6`-Ton (gray-100).
- Innenabstand 16 px.
- **Routenname**: Dunkel `#141414`, fett, 18 px.
- **Distanz**: Strava-Orange `#FC4C02`, fett (Statistik-Akzent wie bei Strava).
- **Datum**: Grau `#9CA3AF`, klein (12 px).
- Beim Drücken: 80 % Deckkraft.

### Karte (Kartenansicht)
- **Routenlinie**: Strava-Orange `#FC4C02`, 4 px dick (Web und Android identisch).
- Startpunkt-Marker: orange/rot, deutlich sichtbar.

### Eingabefelder (Suche, Distanz, Routenname)
- Hintergrund **Weiß**, Rahmen grau `#D1D5DB`, Rundung 12 px, Innenabstand 12–14 px.

### Suchtrefferliste (Nominatim)
- Zeile: Hintergrund **Strava-Hintergrund `#F4F4F4`**, Text grau-dunkel, eine Zeile abgeschnitten.
- Rundung 8 px, beim Drücken 70 % Deckkraft.

### Ladeindikatoren (Spinner)
- Farbe: **Strava-Orange `#FC4C02`** (groß, auf hellen Flächen).
- Im orange gefüllten Button: **Weiß**.

### Hinweis-/Startpunkt-Text
- Beschreibungstext: Grau `#6B7280` (gray-500), 14 px.
- Titel: Dunkel `#141414`, fett, 18–24 px.

### Leerzustand (keine Routen)
- Zentral ausgerichteter grauer Text (`#6B7280`) mit Hinweis auf den Button oben.

## Typografie

- **Titel/Schlagzeilen: Archivo** (700 Bold, 800 ExtraBold) – sportlich, leicht kondensiert, Strava-Charakter.
- **Text/Buttons/Eingaben: Inter** (400 Regular, 500 Medium, 600 SemiBold, 700 Bold) – neutral und gut lesbar.
- Beide Schriften sind eingebettet (Google Fonts, offline verfügbar) – auf Web und Android.
- Gewichte: Titel extrabold, Button-Texte semibold/bold, Beschreibungen regular/medium. **Nie** Fett-Effekt auf einer Gewichts-Schrift kombinieren (jede Gewichtung ist eine eigene Font-Datei).
- Größen:
  - Überschrift Seite: 24 px, Archivo ExtraBold, dunkel
  - Karten-Titel: 18 px, Archivo Bold
  - Button-Text: 16 px, Inter Bold
  - Beschreibungstexte: 14 px, Inter Regular
  - Datum/Dezent: 12 px, Inter Regular

## Dark Mode

- Umschalter: ☾/☀-Symbol rechts in der Kopfzeile, auf allen Screens.
- Auswahl wird auf dem Gerät gespeichert und beim nächsten Start wiederhergestellt.
- Regeln: Orange, Rot und die Kartenkacheln bleiben in beiden Modi identisch; nur die UI-Flächen wechseln (siehe Paletten oben).
- Header: Hell-Modus `#141414` → Dunkel-Modus `#000000`.

## Abstände & Ecken

- App-Hintergrund: `#F4F4F4`, Bedienflächen unten in Weiß mit dünner oberer Trennlinie (`#E5E7EB`).
- Seitenabstand: 16 px.
- Vertikale Abstände zwischen Elementen: 12 px.
- Rundungen: Buttons 12 px, Karten 16 px, Suchtreffer 8 px.
- Schatten nur auf Karten, sehr dezent.

## Interaktions-Zustände

| Zustand | Verhalten |
|---|---|
| Drücken | Deckkraft auf 70–80 % |
| Deaktiviert | Button gesperrt, Inhalt (z. B. Spinner) sichtbar |
| Laden | Spinner ersetzt Button-Text, Klick gesperrt |

## Faustregeln

1. Orange nur für **eine** Hauptaktion pro Ansicht – nie mehrere orange Buttons nebeneinander.
2. Löschen immer Rot, nie Orange.
3. Routenlinie immer Orange – die Karte ist das Herzstück, die Linie der Blickfang.
4. Dunkle Kopfzeile überall gleich, damit die App wie ein Produkt wirkt.
5. Niemals bunte Akzente (Blau, Grün) verwenden – nur Orange, Dunkel, Grau, Rot für Gefahr.