# Native Notationsprüfung – 14.10.2026

MuseScore-Studio-4.7.0.260513133-x86_64.AppImage (Linux), Konvertierungsauftrag mit API-v1-Makro-Erweiterung. Vier versetzt einsetzende Stimmen in zwei Takten; Bass-Haltebogen von Takt 1 zu Takt 2. Quelle: fixtures/notation-staggered-tied.musicxml. Vergleich mit dem echten MusicXML-Export: gleiche klingende Tonhöhen/Einsätze/Dauern, keine weiteren Strukturkorrekturen.

Beobachtete Meldungen:

- `NATIVE primary rewind(240) = 720`
- `NATIVE exact rewind(240) = 240`
- `OLD_CROSS_FAIL Error: Haltebogen über das Auswahlende: bitte weitere Takte markieren.`
- `NEW_CROSS_PASS`
- `Native cross-measure sound equal: true`
- `Further corrections: 0`

Die alte Fassung ist die vom Nutzer hochgeladene 0.10.28. Der neue Adapter ist notation-direct.js. Ein zusätzlicher Ein-Takt-Fall funktioniert auch mit dem alten Adapter. Die konkrete Windows-Ausgangspartitur ist nicht verfügbar; die Verbesserung ist deshalb eine verifizierte Fehlerbehebung im Adapter, keine bestätigte Lösung jedes Windows-Problems.

Der Kommandozeilenprozess schreibt das korrigierte Ergebnis, bricht aber während der Makro-/API-Bereinigung ab (double free/corruption). Ein Kontrollmakro ohne Notenbearbeitung zeigt denselben Abbruch. Kein vollständiger nativer GUI- oder Windows-Test; diese Grenze bleibt offen.
