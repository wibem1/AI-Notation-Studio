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

## Echte MuseScore 4.7.6 – erster CI-Versuch (fehlgeschlagen, Ursache eingegrenzt)
- Run: https://github.com/wibem1/AI-Notation-Studio/actions/runs/42298512439 (06.11.2026).
- Offizielle AppImage wurde heruntergeladen, SHA256-Prüfung bestanden; die Wegwerf-MusicXML wurde erfolgreich nach MSCZ importiert. Sieben simulierbare Testfälle ebenfalls bestanden.
- **Native Plugin-Ausführung wurde NICHT erreicht.** Der AppImage-Lauf unter Xvfb mit `-p native_measure_insertion_probe` meldete `MuseScore4: Unknown options: no-synthesizer, p.` Dieser CLI-Weg ist in exakt dieser Version nicht verfügbar, auch wenn er in online verfügbaren Handbuchseiten noch erwähnt wird.
- Keine Aussage zu `insert-measure`, Rollback oder Notenerhaltung zulässig. Der native Versuch gilt als fehlgeschlagen, nicht als teilweise erfolgreicher Plugin-Test.
- **Vorgehen ändern:** Nicht die gleiche CLI-Methode wiederholen. Für den nächsten nativen Test den echten Pluginmanager in einer Xvfb-GUI automatisieren bzw. die von 4.7.6 tatsächlich unterstützte Plugin-Host-Schnittstelle aus dem Quellcode überprüfen. Dabei Score `ANS-TEST-*` und Vorher-/Nachher-Signaturen kontrollieren. GUI-Sitzung nach abgeschlossenem Versuch mit klarem Beleg protokollieren.
- Keine Veröffentlichung, Änderung der Live-App oder neue Versionsnummer.


## 07.11.2026 – Mehrstimmiger CS1-Transfer und Fehler-Rollback nachgewiesen

Das Entwicklungsmodul `native-prelude-writer.js` besitzt zwei getrennte Schritte: `prepare(score, decodedCS1, explicitMappings)` validiert ohne Mutation; `apply(score, plan, hostAPI)` fügt Takte und Noten in einer nativen Transaktion ein. Es wird noch nicht von der veröffentlichten App geladen. Die CS1-Fixture und die explizite Zuordnung liegen in `tests/fixtures/native-prelude.cs` und `tests/test_native_prelude_plan.cjs`; der Testhost ist `tests/native_polyphonic_probe.qml`.

**Erfolgreicher echter Integrationsnachweis:** https://github.com/wibem1/AI-Notation-Studio/actions/runs/42352037957 (Commit `35d61d8`). Zwei neue Takte, drei Klavierstimmen auf zwei Systemen, 22 Ereignisse mit Akkorden/Pausen/Punktierung und korrektem Fis. `verify_native_polyphonic.py` vergleicht unabhängig handgeschriebene Sollereignisse, sämtliche verschobenen Originaltakte, wirksame Notationsattribute, Fehler-Rollback nach Teilbeschriftung und Ein-Schritt-Undo. Alle Prüfungen bestanden. Kein erneuter KI-Aufruf.

### Ursachen der zuvor gefundenen API-Probleme

- MuseScore v4.7.6 `src/engraving/api/v1/selection.cpp`: `selectRange` verwendet während einer aktiven Transaktion `setRangeTicks`, sonst `setRange`. Bereichsauswahl innerhalb einer offenen Transaktion kann dem Einfügebefehl daher eine ungültige Auswahl hinterlassen (im ersten Test nativer Absturz). Die initiale Auswahl muss vorher erfolgen.
- `src/notationscene/internal/notationactioncontroller.cpp`: `insert-measure` verlangt eine vorhandene Auswahl. Nach der ersten Einfügung war diese innerhalb der äußeren Transaktion nicht nutzbar; der zweite Befehl wurde mit `no one can handle the action` abgelehnt. Vor jeder weiteren Einfügung wählt der Writer eine echte Pause im ersten neuen Takt über `Selection.select`; dieser Aufruf geht direkt über `Score::select` und umgeht die verzögerte Bereichsauswahl. Der endgültige Test beweist zwei Einfügungen in einer Transaktion.
- MusicXML-Exporte wechselten durch die neu eingefügten Achtel von divisions=1 auf divisions=2, auch für Originaltakte. Eine rohe Dauerzeichenketten-Prüfung schlug deshalb trotz gleicher Musik fehl. Der Komparator rechnet Dauer/Offset/Backup/Forward in exakte Brüche um. Drei Negativ-/Äquivalenztests stellen sicher, dass diese Normalisierung keine echten musikalischen Änderungen verdeckt.

### Genaue Grenze

Vollständige 4/4-Takte in C-Dur; Zielinstrumente aktuell Piano/Flöte, explizite Part-/Stimm-/Systemzuordnung. Neue Pedal-/Tempo-/Dynamikzeichen und sonstige unbekannte Ereignisfelder, Tuplets, Vorschläge, Bögen oder andere Takt-/Tonarten werden vor Mutation abgelehnt. **Vorhandene** solche Ausdruckszeichen werden im Test erhalten; ihre **neue Erzeugung** ist damit nicht bewiesen. Keine produktive Ausgabeziel-UI, keine Integration sämtlicher Kompositionsmodi, kein Windows-End-to-End-Test und keine Freigabe. Live 0.11.11 bleibt unverändert.
