# DLRG Fallbeispiel-App 🛟

App für Android und iOS für das Jugend-Einsatz-Team: Fallbeispiele (realistische Notfälle)
werden in echt nachgespielt, die Spielleitung steuert live die **Vitalwerte** und die
Zuschauer:innen **bewerten mit einer Checkliste**, was die Helfer:innen gemacht haben.

## Funktionen

- **9 fertige Fallbeispiele** (Ertrinkungsunfall, Reanimation, Unterzuckerung, starke Blutung,
  Allergie, Wirbelsäule, Sonnenstich, Unterkühlung, Krampfanfall) – jeweils mit
  Lage zum Vorlesen, geheimer Mimen-Anleitung, Schminke/Requisiten, Vitalwerten und Checkliste.
- **Patientenmonitor** mit Puls, SpO₂, Atemfrequenz, Blutdruck, Blutzucker, Temperatur,
  Bewusstsein, Haut und Pupillen. Werte außerhalb des Normbereichs werden rot markiert.
  - Spielleitung ändert Werte live mit **+ / –** oder schaltet auf „Nach Behandlung“ um.
  - **Messen-Modus**: Werte sind verdeckt und erscheinen erst, wenn die Helfer:innen sie
    „messen“ (antippen) – so muss man wirklich nachfragen/messen.
- **Timer** für den Durchgang, Bildschirm bleibt dabei an.
- **Live-Bewertung** schon während der Übung (Reiter „Live-Bewertung“), mit Zeit seit Start für jeden Punkt.
  Beim Beenden wird sie automatisch als Bewertung übernommen.
- **Bewertung**: Jede:r Zuschauer:in hakt die Checkliste ab (Punkte, „WICHTIG“-Punkte) und kann Feedback schreiben.
- **Ergebnis**: Prozent, Note, vergessene wichtige Punkte, Balken pro Prüfpunkt, Feedback –
  und **Teilen** (z.B. in die WhatsApp-Gruppe).
- **Schwierigkeit** leicht / mittel / schwer für jeden Fall, mit Filter auf der Startseite.
- **Anleitung**: Rollen, Ablauf Schritt für Schritt, Nachbesprechung und Sicherheitsregeln.
- **Helfer:innen mit eigener Akte**: Beim Start wählt man aus, wer hilft. Jede Person hat eine Akte mit allen
  Einsätzen, Durchschnitt, bestem Ergebnis, Ergebnis je Schwierigkeit, „Klappt schon gut“ und „Daran noch arbeiten“.
- **Einsatz-Historie** aller Durchgänge, filterbar nach Schwierigkeit und Person.
- **Eigene Fallbeispiele** erstellen oder vorhandene als Vorlage kopieren.
- **Einstellungen** (im Menü ☰): Hell / Dunkel / wie Handy, Töne, Vibration, Messen-Modus automatisch, Zeitlimit mit Signalton,
  Daten löschen.
- **Dark Mode** für die ganze App.
- **Töne**: Herzschlag-Piepton im Takt des Pulses, Alarm wenn ein Vitalwert auffällig wird, Klick beim Abhaken,
  Signal beim Zeitlimit. Die Töne stehen in `src/lib/tonDaten.ts`; die WAV-Dateien fürs Handy erzeugt
  `node --experimental-strip-types scripts/erzeuge-toene.ts`.
- **Bewertungskriterien abwählen**: Vor dem Start Punkte antippen, die diesmal nicht bewertet werden sollen.
- **Burger-Menü (☰)** oben rechts mit allen Bereichen und direktem Zugriff auf die Akten, **Zurück-Knopf** oben links.
- Alles wird auf dem Handy gespeichert (kein Internet nötig).

> ⚠️ Die Inhalte sind Übungsmaterial. Bitte vor dem Einsatz mit euren Ausbilder:innen abstimmen.

## App auf das Handy laden (Android)

Bei jeder Änderung an der App baut GitHub automatisch eine neue **APK-Datei** (Workflow `.github/workflows/android-apk.yml`).

1. Auf dem Handy öffnen: **https://github.com/linus71111/airnut/releases/latest**
2. `DLRG-Fallbeispiel.apk` antippen und herunterladen.
3. Datei öffnen → dem Browser erlauben, Apps zu installieren → „Installieren“.
   Wenn Google Play Protect warnt: „Trotzdem installieren“ (die App ist nicht aus dem Play Store, deshalb die Warnung).

## App auf das iPhone laden (Web-App)

Die App wird automatisch als Web-App auf GitHub Pages veröffentlicht (Workflow `.github/workflows/web-app.yml`),
zusammen mit der Webseite aus dem Branch `Website_1_0`:
**https://linus71111.github.io/airnut/app/**

1. Den Link in **Safari** öffnen (nicht in Chrome oder in der Claude-App).
2. Unten auf **Teilen** (Viereck mit Pfeil) tippen → **„Zum Home-Bildschirm“** → **Hinzufügen**.
3. Die App erscheint mit dem Rettungsring-Symbol auf dem Home-Bildschirm, startet ohne Browserleiste
   und funktioniert nach dem ersten Öffnen auch ohne Internet.

Einmalig nötig: In GitHub unter **Settings → Pages** bei „Build and deployment“ die Quelle
**„Deploy from a branch“**, Branch **`gh-pages`** und Ordner **`/ (root)`** wählen und speichern.

Für eine „echte“ App aus dem App Store braucht man einen Apple-Developer-Account (99 € pro Jahr) und EAS Build.

## Auf dem Handy testen (mit Expo Go)

Du brauchst einen Computer (Windows, Mac oder Linux) und dein Handy im **selben WLAN**.

1. **Auf dem Computer installieren:**
   - [Node.js](https://nodejs.org) (die „LTS“-Version)
   - [Git](https://git-scm.com/downloads)
2. **Auf dem Handy installieren:** die App **Expo Go** (App Store bzw. Google Play Store).
3. **Code herunterladen** – im Terminal (Windows: „Eingabeaufforderung“ oder „PowerShell“):
   ```bash
   git clone https://github.com/linus71111/airnut.git
   cd airnut
   git checkout claude/fallball-app-dlrg-bdf20o
   cd fallbeispiel-app
   npm install
   ```
4. **App starten:**
   ```bash
   npx expo start
   ```
   Es erscheint ein QR-Code im Terminal.
5. **QR-Code scannen:**
   - Android: in der App Expo Go auf „Scan QR code“ tippen.
   - iPhone: mit der normalen Kamera-App scannen und auf den Link tippen.

Die App öffnet sich in Expo Go. Wenn du am Code etwas änderst, aktualisiert sie sich sofort.

**Probleme?**
- *Handy findet den Computer nicht* (z.B. anderes WLAN, Schul-/Firmen-WLAN): `npx expo start --tunnel` verwenden.
- *Expo Go meldet eine falsche Version*: Expo Go im Store aktualisieren. Die App nutzt Expo SDK 57.
- Mit `npx expo start --web` läuft die App auch im Browser am Computer.

## Echte App bauen (für App Store / Play Store)

Das geht mit EAS (Expo Application Services) in der Cloud – ohne Mac oder Android Studio:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android   # .apk/.aab für Android
npx eas-cli@latest build --platform ios       # braucht einen Apple-Developer-Account
```

Für Android kannst du dir eine APK zum direkten Installieren bauen lassen (Profil `preview`, siehe EAS-Doku).
Die Paketnamen stehen in `app.json` (`de.jet.fallbeispiel`) – ändert sie ggf. vor dem ersten Build.

## Aufbau des Codes

| Ordner / Datei | Inhalt |
| --- | --- |
| `src/app/` | Die Bildschirme (jede Datei = ein Screen, Expo Router) |
| `src/app/index.tsx` | Startseite mit Liste der Fallbeispiele |
| `src/app/fall/[id].tsx` | Details zu einem Fall + Durchgang starten |
| `src/app/durchgang/[id].tsx` | Live-Übung: Timer & Vitalwerte steuern |
| `src/app/bewerten/[id].tsx` | Checkliste für Zuschauer:innen |
| `src/app/ergebnis/[id].tsx` | Auswertung |
| `src/app/editor.tsx` | Eigene Fälle anlegen/bearbeiten |
| `src/app/anleitung.tsx` | Anleitung zum Ablauf eines Fallbeispiels |
| `src/app/personen/` | Liste der Helfer:innen und ihre Akte |
| `src/app/verlauf.tsx` | Einsatz-Historie |
| `src/data/faelle.ts` | **Die fertigen Fallbeispiele – hier könnt ihr Texte & Checklisten anpassen** |
| `src/lib/vitals.ts` | Normbereiche der Vitalwerte |
| `src/components/VitalMonitor.tsx` | Der Patientenmonitor |

## Ideen für später

- Mehrere Handys gleichzeitig (jede:r bewertet auf dem eigenen Handy) – dafür braucht es einen
  Server/Datenbank, z.B. Firebase oder Supabase.
- Fallbeispiele per QR-Code mit anderen Gruppen teilen.
- Kinder-Normwerte (Puls/Atmung sind bei Kindern anders).
