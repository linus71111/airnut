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
- **Bewertung**: Jede:r Zuschauer:in hakt die Checkliste ab (Punkte, „WICHTIG“-Punkte) und kann Feedback schreiben.
- **Ergebnis**: Prozent, Note, vergessene wichtige Punkte, Balken pro Prüfpunkt, Feedback –
  und **Teilen** (z.B. in die WhatsApp-Gruppe).
- **Schwierigkeit** leicht / mittel / schwer für jeden Fall, mit Filter auf der Startseite.
- **Anleitung**: Rollen, Ablauf Schritt für Schritt, Nachbesprechung und Sicherheitsregeln.
- **Helfer:innen mit eigener Akte**: Beim Start wählt man aus, wer hilft. Jede Person hat eine Akte mit allen
  Einsätzen, Durchschnitt, bestem Ergebnis, Ergebnis je Schwierigkeit, „Klappt schon gut“ und „Daran noch arbeiten“.
- **Einsatz-Historie** aller Durchgänge, filterbar nach Schwierigkeit und Person.
- **Eigene Fallbeispiele** erstellen oder vorhandene als Vorlage kopieren.
- Alles wird auf dem Handy gespeichert (kein Internet nötig).

> ⚠️ Die Inhalte sind Übungsmaterial. Bitte vor dem Einsatz mit euren Ausbilder:innen abstimmen.

## Loslegen (auf deinem Computer)

Du brauchst [Node.js](https://nodejs.org) (Version 20 oder neuer) und auf dem Handy die App **Expo Go**
(im App Store / Play Store).

```bash
cd fallbeispiel-app
npm install
npx expo start
```

Dann den QR-Code mit dem Handy scannen (Android: in Expo Go, iPhone: mit der Kamera) – die App startet sofort.
Mit `npx expo start --web` kannst du sie auch im Browser ausprobieren.

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
