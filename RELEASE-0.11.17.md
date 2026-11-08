# AI Notation Studio 0.11.17 – musikalische Bindung bei Fortsetzungen

**Datum:** 8. November 2026

## Korrekturen
- **Referenztonhöhen:** MuseScore exportiert `pitchMidi` und `pitchName`. Die kompakte Übertragung berücksichtigt diese Felder und lässt Melodie und Harmonik nicht mehr aus der an die KI gesendeten Referenz verschwinden.
- **Fortsetzungsprompt:** Ausdrückliche Vorgabe, Themen, Motive, Begleitung, Harmonik, Instrumentrollen und Grundtempo des Originals weiterzuführen.
- **Tonartkontrolle:** Ausgangstonart aus MusicXML (Vorzeichen, gegebenenfalls Modus) wird gegen die Grundtonart des KI-Ergebnisses geprüft. Eine nicht ausdrücklich beauftragte Abweichung führt vor der Übernahme zur Ablehnung. Für mehrdeutige oder nicht deklarierte Quelltonarten kann diese Kontrolle keinen musikalischen Identitätsnachweis liefern.
- **Tempokontrolle:** Ohne ausdrücklichen Tempoauftrag werden Grundtempoänderungen von mehr als 1 BPM zurückgewiesen. Expressive lokale Rubati sind damit nicht pauschal verboten.
- **Ergebnisbehandlung:** Ein abgelehnter Entwurf bleibt gespeichert; erneutes kostenloses Prüfen komponiert kein neues Ergebnis und kann eine musikalisch falsche Fortsetzung nicht retten.

## Prüfungen
- [Musikalische Vertrags- und Referenzregression #42508438121](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42508438121): **SUCCESS**, Node und Klavier-Anfügetest.
- [Nativer MuseScore-Studio-4.7.6-Test #42508438091](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42508438091): **SUCCESS** unter Linux; synthetische 28→30-Takte-Fortsetzung bei drei einzeiligen Parts, zuvor Ablehnung einer absichtlich unpassenden Tonart, unveränderte Originalnoten, erfolgreiche Übernahme als neue Partitur und Diagnoseexport.
- Keine kostenpflichtige Modellanfrage, keine echte vom Nutzer musikalisch bewertete Gemini-Fortsetzung. Der echte macOS-Speicherdialog bleibt weiterhin nicht nativ getestet.

## Nutzung
**Update prüfen → Update installieren.** Anschließend bei geöffneter Ausgangspartitur einen **neuen** Fortsetzungsauftrag starten (die alte KI-Antwort enthält die musikalischen Fehlentscheidungen bereits). Für den ersten Praxistest **Neue Partitur** als Ziel wählen. Eine musikalische Ähnlichkeit von Motiven ist durch Tonart- und Tempoprüfungen allein nicht bewiesen.

Bisherige versionierte Releases bleiben unverändert.
