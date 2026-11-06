# Native Übernahme in die bestehende MuseScore-Partitur – isolierter Machbarkeitstest

Stand: 06.11.2026 · Entwicklungsbranch `feat/native-output-target-spike-20261106` · Issue #2.

## Gesicherter Ausgangspunkt
- Live `0.11.11` und Starter `0.7.27` bleiben unverändert.
- `AI-Notation-Studio-App.qml:848–877`: `openCompactScore()` erzeugt CS1 und MusicXML und ruft `readScore(..., false)` auf. Dies öffnet eine **neue** Partitur; es ist kein In-Place-Schreiben.
- `AI-Notation-Studio-App.qml:4489–4554` zeigt eine vorhandene native Score-Transaktion mit `startCmd`/`endCmd(rollback)`. Dies beweist **nicht**, dass ein vollständiger MusicXML-Vorspielimport in dieselbe Score-Instanz unterstützt wird.
- `API-AUDIT.md`: `appendMeasures` hängt nur an. Weder ein atomarer MusicXML-Ersetzen-Aufruf noch ein vollständiger Part-/Staff-/Spanner-Transfer ist belegt.

## Ein einziger nächster Entwicklungsschritt: native Einfügefähigkeit nachweisen
1. **Separates, nicht ausgeliefertes MuseScore-Testplugin** schreiben; weder Live-QML noch Updater, Versionseinträge oder Nutzerpartitur verändern.
2. Synthetische Partitur (Flöte, Violine, Klavier rechts/links, 32 Takte) in MuseScore Studio 4.7.6 erstellen; unveränderten MSCZ-Snapshot und vor dem Test exportierte MusicXML sichern.
3. Ermitteln, ob und über welche dokumentierten/aus Quellcode nachgewiesenen QML-API-v1-Kommandos **zwei volle Takte vor Takt 1** eingefügt werden können, ohne bestehende Ereignisse zu rekonstruieren. Falls nicht zuverlässig möglich: **Abbruch; keine Scheinlösung über `readScore`**.
4. Nach erfolgreichem Leertakt-Einfügen die exakte Identität/Reihenfolge von Parts und Staves, Taktanzahl, Originalnotensignatur und unveränderte Metadaten/Spanner vor und nach der Operation exportiert vergleichen.
5. In eigenem Test schrittweise polyphone Noten, Pausen, Tuplets, Tempo, Dynamik, Ties, Slurs und Pedal übertragen. Jede nicht dokumentierte oder nicht roundtrip-stabile Elementart ist ein **Release-Blocker**, keine stille Auslassung.
6. **Undo in MuseScore** muss mit *einem* Rückgängig-Schritt den ursprünglichen Snapshot musikalisch und strukturell wiederherstellen. Erzwungener Fehler mitten in der Operation muss über `endCmd(true)` vollständig zurückrollen.
7. Erst danach kann die gemeinsame UI-Auswahl implementiert werden. Ausgabeziel `bestehend` darf bis zum nachgewiesenen Integrationspfad nicht als ausführbarer Standard angeboten werden.

## Gemeinsame Ausgabeziel-Architektur – nur nach bestandener Machbarkeit
- Bereits generiertes und validiertes `compositionJson` einmalig verwenden. Bei Auswahlwechsel **kein Provider-Aufruf**.
- Gemeinsame Vorbereitung: `compositionJson → CS1 → MusicXML → validierte Partzuordnung/Einfügeplan`.
- `neue Partitur`: bestehende `readScore`-Route unverändert beibehalten.
- `bestehende Partitur`: eigener nativer, transaktionaler Writer; vor der ersten Mutation alle erforderlichen Fähigkeiten und den Ursprungs-Snapshot prüfen; danach Postcondition-Check und Rollback bei Fehler.
- Vorspiel = Takte voranstellen; Fortsetzung = am Ende ergänzen; Variation/Ersetzen = **eigene ausdrücklich geprüfte Bereichssemantik**. Kein gemeinsamer blinder Cursor-Schreibpfad.
- User-UI: `Übernehmen in: Bestehende Partitur | Neue Partitur`; gewünschter späterer Standard `Bestehende Partitur`. Bis native Tests vorliegen, **kein betriebsbereiter Schalter**.
- MusicXML-Layoutkorrekturen (doppelte Instrumentennamen, Startangaben, Pedalzuordnung, leerer Rahmen) werden separat geprüft; sie können nicht als Nachweis der nativen Einfügung dienen.

## Qualitätsnachweise
Als **implementiert** gilt nur nach Code-Commit; als **statisch geprüft** nach unabhängigem Code-/Testlauf; als **nativ getestet** erst nach echtem MuseScore-4.7.6-Run mit Vergleichsartefakten. Vor Release zusätzlich Windows-GUI-Test durch Nutzer bzw. Windows-Testumgebung. Kein kostenpflichtiger KI-Aufruf nötig.

**Aktueller Nachweisstand dieses Dokuments:** Analyse und Testprotokoll erstellt; native Machbarkeit **noch nicht bewiesen**, kein Einfügecode integriert, kein Release.

## Zwischenprüfung 06.11.2026 – abgesicherter Testcode, noch keine native Engine
- Probe: `tests/native_measure_insertion_probe.qml` im separaten Branch. Guard: nur `workTitle` mit Präfix `ANS-TEST-`; der Test verlangt mindestens zwei Takte, prüft `Selection.selectRange`, führt einen `insert-measure`-Befehl aus und fordert **immer** `endCmd(true)` an.
- Automatisierter simulierter Pfadtest: `node tests/test_native_measure_probe.cjs`. Sieben Fälle (Normal-Rollback, gewöhnlicher Score verweigert, kein Score, fehlende Selection-API, Exception beim Insert, Insert ohne Wirkung, wirkungsloser Rollback) lokal mit Node 22 erfolgreich.
- API-Dokumentation bestätigt `Cursor.nextMeasure()` und `Score.endCmd(true)`; dies ist **kein Beweis**, dass `insert-measure` in MuseScore 4.7.6 vom QML-Plugin in genau diesem UI-Kontext akzeptiert und in die bestehende Undo-Transaktion aufgenommen wird.
- **Umgebungsgrenze:** Hier kein MuseScore-Binary installiert; kein nativ ausgeführter QML-Plugin-Test. Die MuseScore-Engine wurde nicht simulativ als echt ausgegeben. Ein isolierter nativer Test auf einer Wegwerfpartitur bleibt Voraussetzung.
- Die Kontrollgrößen (Taktzahl, Staffzahl) belegen noch weder die richtige **Position** noch die Erhaltung von Noten, Tonarten und Spanners. Dafür sind Vorher/Nachher-XML-Vergleiche und tatsächlicher MuseScore-Undo erforderlich.
- **Freigabestand:** Nicht releasefähig. Kein Wechsel der Standardeinstellung, kein Live-Update, keine Änderung der 0.11.11.
