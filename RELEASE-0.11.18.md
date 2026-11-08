# AI Notation Studio 0.11.18 – Fehlende Trennzeichen in KI-Noten reparieren

**Datum:** 08.11.2026

## Problem
Eine echte Gemini-4-Argon-Fortsetzung (3 Übergangstakte + 16 neue Takte, drei Instrumentparts) schlug in 0.11.17 beim CS1-Einlesen mit `Zeile 19: JSON.parse: Parse error` fehl. Die Noten der Antwort waren auf einer Zeile zusammengeschoben, etwa `C5:s{"i":"v16_1"}E5:sA5:sC6:s`. Die Antwort wurde vom Plugin vollständig gespeichert; sie muss **nicht erneut kostenpflichtig erzeugt** werden.

## Korrektur
Die Funktion `repairAdjacentCompactEvents` ergänzt nur die eindeutig fehlenden Trennzeichen zwischen legal geformten CS1-Notenereignissen in Takt-/Stimmenzeilen und reicht das Ergebnis danach an den unveränderten strengen Decoder weiter. Kein pauschales Quantisieren, keine Tonhöhenänderung, keine Längenänderung, keine stille Reparatur unklarer Ereignisse. Die Original-KI-Antwort bleibt erhalten und kann über `Gespeicherte KI-Antwort erneut prüfen (kostenfrei)` neu verarbeitet werden. Andere formale, rhythmische oder musikalische Fehler können danach weiterhin abgelehnt werden.

## Prüfung
- `tests/test_cs1_adjacent_events.cjs`: zusammengeklebte Ereignisse, unveränderte Header und sonstige Zeilen, Idempotenz, Ablehnung nicht eindeutiger Fehler, Test mit eingebettetem CompactScore-Decoder.
- GitHub-Actions-Regression und echter nativer MuseScore-4.7.6-Integrationstest mit synthetisch zusammengeklebten Noten, tatsächlichem Plugin-Verarbeitungspfad, neuen Takten und unverändertem Original.
- Vorläufige Entwicklungsprüfungen: [Regression #42509868081](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42509868081) **SUCCESS** und [MuseScore #42509868029](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42509868029) **SUCCESS**. Finale Versionsprüfungen auf 0.11.18 müssen vor der Freigabe erfolgreich sein.
- Kein kostenpflichtiger KI-Aufruf; private Musik wurde nicht auf GitHub veröffentlicht.

## Anwendung
Im Plugin **Update prüfen → Update installieren**, dann **Gespeicherte KI-Antwort erneut prüfen (kostenfrei)**. Danach zunächst Ausgabeziel **Neue Partitur** wählen. Die erzeugte Musik muss vom Nutzer anschließend musikalisch beurteilt werden; technische Gültigkeit garantiert keine passende Fortsetzung.
