## v0.10.30 – 14.10.2026

Bestanden: Node-Tests für Struktur, direkte Bearbeitung und Kopieweg; Qt-5-Oberfläche und Update-/Neustart. Neue Regressionen reproduzieren MuseScores stimmabhängigen Cursor-Sprung sowie einen Bassbogen zwischen zwei vollständig umgebauten Takten. Ein Bogen außerhalb des Plans bleibt vor Mutation abgewiesen.

Native MuseScore-4.7.0-Ausführung und die unabhängig geprüfte reale MusicXML-Ausgabe: zwei Takte direkt umgebaut, dieselben klingenden Noten, keine weitere Strukturkorrektur. Der native Makroprozess stürzt danach beim Beenden ab; Kontrollmakro ohne Notenänderung reproduziert dies ebenfalls. Siehe tests/NATIVE-NOTATION-0.10.30.md. Windows-GUI nicht getestet.

## v0.10.29 – 14.10.2026

Bestanden: `node tests/test_notation_open.js`, `node tests/test_notation_structure.js`, `node tests/test_notation_direct.js`, `python tests/test_ui.py`, `python tests/test_ui.py --qt5`, `python tests/test_update_restart.py --qt5` und `git diff --check`.

Der neue Test prüft den tatsächlichen QML-Funktionscode mit der echten Strukturengine. Geprüft sind korrigierte Ausgabe mit unveränderten klingenden Noten, verfügbarer Plan nach direktem Fehler, Öffnen trotz aufgehobener Auswahl, Ablehnung bei veränderter Ausgangspartitur oder Klangsignatur, Datei-/Importfehler ohne Erfolgsmeldung und anschließende Wiederholung. Der tatsächliche QML-Button und die sichtbare Statusanzeige wurden unter Qt 5 und Qt 6 geprüft. Der Update-Neustarttest wurde auf 0.10.28 → 0.10.29 angepasst und prüft auch einen frischen Prozess.

Qt 6.12.0 reproduziert im Update-Neustarttest den bereits dokumentierten „File name case mismatch“-Fehler. Qt 5.15.11 besteht. Die Import-/Direkt-APIs sind Testobjekte; kein nativer MuseScore-Praxistest. Die konkrete Ursache des direkten Haltebogenfehlers bleibt offen.

# Testplan v0.7.0

## Version 0.10.24 – 12.10.2026

Ausgeführt unter Windows, Python 3.12, PySide6/Qt 6.8.3 und PyQt5/Qt 5.15.2. QML-/MuseScore-/FileIO-Testobjekte, keine kostenpflichtigen API-Aufrufe und kein echter MuseScore-Laufzeittest dieser Änderung.

- Alle zwölf `tests/test_*.py` unter Qt 6.8.3 bestanden: CompactScore/MusicXML-XSD, Diagnose-Komposition, realer Windows-Helfer, Loader, Modellkatalog, Ergebnisspeicherung, Startdatensatz, Oberfläche, Update, Update-Neustart, Workflows und Fensterbeschnitt. Nach den letzten Änderungen betroffene Diagnose-, CompactScore-, Workflow-, Ergebnis- und Update-Neustarttests erneut bestanden.
- Qt 5.15.2: Loader, Oberfläche, Ergebnisspeicherung/Diagnose und Update-Neustart nach den letzten Änderungen bestanden.
- `test_diagnostic_composition.py` führt echte QML-JS-Funktionen aus: vollständiges Live-XML trotz leerer Arbeitsnotation, Score-gebundene ursprüngliche Provider-/Modell-/Usage-Daten, ungerundete Tarifkosten, keine erfundenen Rechnungsbeträge, fehlende Thinking-Zahlen, CS1-Dekodierung, beschädigte Metadaten und Exportfehler. Score-Metadaten speichern/leeren/laden, Herkunft vor Arbeitsänderungen schützen, Revisionen, Verlaufsbackup und Korruptionsschutz, eindeutige historische Zuordnung und Ablehnung mehrdeutiger Zuordnung geprüft.
- `test_diagnostic_helper.py`: echter PowerShell-Helfer, 46.137.355 Bytes, SHA-256, Überschreiben, Unicode und Shell-Sonderzeichen, ungültige Ziele und Schutz der Quelle bestanden. Kein manueller SaveFileDialog-Test.
- Qt 6.12.0: Update-Neustarttest scheitert weiterhin mit „File name case mismatch“. Bereits in den bisherigen Prüfnotizen beschrieben; keine Freigabe für diese Laufzeit. Ein Qt-IO-Testobjekt und ein Lauf außerhalb der Sandbox beseitigten den Fehler nicht; der Test bleibt unverändert streng.
- Zwei nachgereichte Originaldiagnosen analysiert: „Vom Sturm umtost“ enthält übereinstimmende CS1-/JSON-Daten, 32 Takte und ursprüngliche Usage trotz leerer Sitzungswerte. Die zweite nennt als geöffnetes Score „Mit zarter Sehnsucht“, enthält aber CS1/JSON und KI-Aufruf für „Hans im Glück“. Deren Daten dürfen der vorhandenen Partitur nicht zugeschrieben werden; Regressionstest ergänzt. Der eigentliche Inhalt von „Mit zarter Sehnsucht“ fehlt in der alten Diagnose und ist ohne Score-Datei nicht überprüfbar. Beide Arbeitsergebnisse erzeugen XSD-gültiges MusicXML. Bei beiden setzt die unspezifische Bassschlüssel-Markierung einen Bassschlüssel im oberen System; keine automatische musikalische Korrektur vorgenommen. Bereits verlorene historische Kosten/Tokenzahlen sind ohne gespeicherte Usage nicht rekonstruierbar.

Praktisch offen: unter der verwendeten MuseScore-Version eine vorhandene geänderte Partitur öffnen, Diagnose exportieren und alle Parts/Takte im MusicXML vergleichen; neue KI-Komposition erzeugen, übernehmen, MSCZ speichern, MuseScore schließen und wieder öffnen, ursprüngliche Usage und Herkunftsrevisionen erneut exportieren. Den frei gewählten Windows-Speicherdialog manuell prüfen.

## Version 0.10.23 – 12.10.2026

- Qt 5.15.2 / Qt 6.10.2: Oberfläche, Kopieren, Vorbereitung des Diagnoseexports, getrennte Prozessargumente, Erfolgs-/Abbruch-/Fehlerrückmeldungen und Update-Neustarttests.
- `tests/test_diagnostic_helper.py`: realer PowerShell-Helfer, 46.137.355 Bytes, SHA-256, vorhandene Zieldatei ersetzen, Unicode/Leerzeichen/Shell-Sonderzeichen, ungültiger Zielordner, Schutz der Quelldatei.
- MuseScore 4.7.5: QProcess startet den eingebetteten Helfer; 4.700.913 Bytes außerhalb der FileIO-Verzeichnisse erfolgreich gespeichert und nachgelesen. Der Zielpfad wurde für diesen automatisierten Test als Helferargument vorgegeben; die manuelle Windows-Dialogauswahl wurde nicht automatisiert.

## Version 0.10.22 – 12.10.2026

- Qt 5.15.2 und Qt 6.10.2: echte QML-Oberfläche mit MuseScore-/FileIO-Testobjekten laden, Clipboard prüfen, Scrollen und Größenänderung prüfen.
- `tests/test_result_storage.py`: vollständiger Unicode-Text in Zwischenablage, leeres Ergebnis, Protokollnachkontrolle, alternative Verzeichnisse, Schreibfehler und abweichender Dateiinhalt.
- `tests/test_update.py`: Download-Callbacks, HTTP-Fehler, Versionsvergleich und Schreiben der versionierten Datei.
- `tests/test_update_restart.py`: fehlerhafte QML wird vor Aktivierung abgewiesen; alte aktive Version bleibt erhalten. Erfolgreiches Update, Wiederöffnen mit derselben Engine und neuer Prozess.
- Qt 6.12.0: Update-Neustarttest scheitert in der Windows-Testumgebung mit „File name case mismatch“ bei der neu geschriebenen Datei. Keine Freigabe für diese Laufzeit.
- MuseScore 4.7.5 / Qt 6.10.2: gesamte App über den nativen Erweiterungsaufruf geladen. Speichertest-Protokoll erfolgreich geschrieben und nachgelesen, Kopierfunktion ohne API-Fehler ausgeführt. Native Live-Aktivierung einer Testfolgeversion erfolgreich; Active.json benennt die geladene Version. Testdateien lagen in einem temporären Unterordner der Plugins und wurden danach entfernt.
- Für den unsichtbaren Konsolentest waren das zur MuseScore-Version passende Offscreen-Modul und der explizite QML-Importpfad nötig. Die reguläre GUI-Installation benötigt diese Testkonfiguration nicht.

## Start und Update

- [ ] Plugin öffnet sich als v0.7.0.
- [ ] Updateprüfung funktioniert weiterhin.
- [ ] Provider, Modell und Keys bleiben erhalten.

## Bestehende Funktionen

- [ ] Auswahl lesen
- [ ] Auswahl analysieren
- [ ] neue Stimme zu Auswahl
- [ ] freie Komposition
- [ ] Zwei-Stufen-Verfahren

## Neue Kontextmodi

- [ ] Fortsetzen am Partiturende
- [ ] Fortsetzen außerhalb des Partiturendes wird sicher abgewiesen
- [ ] Aus Motiv entwickeln
- [ ] Variante erzeugen: genau eine Variante
- [ ] andere Besetzung
- [ ] neue Zielparts haben die richtigen Instrumente
- [ ] Klavier besitzt zwei Systeme

## Chat

- [ ] Besprechen verändert die Partitur nicht
- [ ] markierte Passage wird als Kontext berücksichtigt
- [ ] Ändern erzeugt einen Bearbeitungsauftrag
- [ ] Bearbeitungsauftrag lässt sich ins Auftragsfeld übernehmen
- [ ] Neuer Chat leert den Verlauf
- [ ] Chat bleibt nach Neustart erhalten

## Undo/Redo

- [ ] Rückgängig nimmt die letzte Plugin-Änderung zurück
- [ ] Wiederholen stellt sie wieder her
- [ ] normale MuseScore-Historie bleibt konsistent

## Diagnose und Protokoll

- [ ] Kommunikationsprotokoll wird angezeigt
- [ ] Diagnose enthält keine API-Keys
- [ ] Tokenwerte werden für verwendete Provider erfasst
- [ ] unbekannte Kosten werden als nicht berechenbar bezeichnet

## v0.7.2 – leere Endtakte

- [ ] Ausgangspartitur mit 32 leeren Takten, Auftrag 16 Takte.
- [ ] Komposition landet in den ersten 16 Takten.
- [ ] Nach dem Einfügen bleiben genau 16 Takte übrig.
- [ ] Kommunikationsprotokoll zeigt before/requested/after.

## v0.7.4 – Layout / Info / Updater

- [ ] v0.7.3 erkennt v0.7.4 über **Update prüfen**.
- [ ] **Update installieren** schreibt die neue Datei und bestätigt v0.7.4.
- [ ] Nach MuseScore-Neustart steht oben v0.7.4.
- [ ] Info-Dialog öffnet und schließt korrekt.
- [ ] Komposition/Analyse und Partitur-Chat sind optisch eindeutig getrennt.
- [ ] Chat-Modi **Nur besprechen** / **Änderung vorbereiten** funktionieren.
- [ ] Vorschlag lässt sich bewusst als Kompositionsauftrag übernehmen.

## v0.7.6 – Gedächtnis

- [ ] Allgemeine Vorbelegungen bleiben nach MuseScore-Neustart erhalten.
- [ ] Zwei unterschiedliche Scores erhalten getrennte Chatverläufe.
- [ ] Score A lädt nicht den Chat von Score B.
- [ ] Score-Gedächtnis bleibt nach Speichern, Schließen und erneutem Öffnen erhalten.
- [ ] Generelles Gedächtnis gilt in beiden Scores.
- [ ] Score-Gedächtnis lässt sich leeren, ohne das generelle Gedächtnis zu verändern.
- [ ] Generelles Gedächtnis lässt sich leeren, ohne Score-Gedächtnisse zu verändern.

## v0.7.8 – Technisches / Updater-Test

- [ ] v0.7.7 erkennt v0.7.8 über **Update prüfen**.
- [ ] **Update installieren** schreibt v0.7.8 ohne manuellen Terminal-Schritt.
- [ ] Nach MuseScore-Neustart steht oben v0.7.8.
- [ ] Provider, Modell und API-Key stehen unten unter **Technisches**.
- [ ] Der obere Bereich **Komposition / Analyse** enthält keine Provider-/Key-Felder mehr.
- [ ] Gespeicherte Provider-, Modell- und Key-Werte bleiben erhalten.

## v0.7.9 – Technisches einklappbar

- [ ] **Technisches** lässt sich auf- und zuklappen.
- [ ] Provider, Modell und API-Key sind im eingeklappten Zustand verborgen.
- [ ] Der letzte Auf-/Zuklapp-Zustand bleibt nach Plugin-Neustart erhalten.
- [ ] Update von v0.7.8 auf v0.7.9 funktioniert ohne Terminal-Schritt.

## v0.7.10 – Loader-Brücke

- [ ] Update von v0.7.9 auf v0.7.10 wird gefunden und installiert.
- [ ] Nach dem einmaligen MuseScore-Neustart startet v0.7.10 normal.
- [ ] Ohne veröffentlichte `AI-Notation-Studio-App.qml` fällt die Updateprüfung sauber auf die monolithische Datei zurück.
- [ ] Späterer Live-Test: eine veröffentlichte App-Version wird als versionierte lokale QML-Datei geschrieben und nach Versionsprüfung ohne MuseScore-Neustart geladen.
- [ ] Nach erneutem Start wird die zuletzt aktivierte Live-App aus den gespeicherten Einstellungen geladen.

## v0.8.0 – Live-Update-Test

- [ ] In v0.7.10 findet **Update prüfen** v0.8.0 als Live-Update.
- [ ] **Update installieren** schreibt und prüft die lokale versionierte App-Datei.
- [ ] Direkt danach wechselt die sichtbare Oberfläche auf **v0.8.0**, ohne MuseScore-Neustart.
- [ ] Komposition/Analyse, Chat, Gedächtnis und **Technisches** sind weiterhin vorhanden.
- [ ] Provider/Modell/API-Key bleiben erhalten.
- [ ] Schließen des Plugin-Fensters beendet MuseScore nicht.
- [ ] Nach einem späteren MuseScore-Neustart lädt der Host die gespeicherte Live-App wieder.

## 0.9.0 CompactScore

Automatisch geprüft: Qt-QJSEngine-Roundtrip, vollständige 16 Takte der Elegie und des Herbstlichen Abendgesangs, feste Klavier-Stimmenverteilung, Tuplets, Bögen, Atemzeichen, Pedal, Tempo, MusicXML-4.0-XSD, Erhalt der Quelldaten, Import-/Öffnen-Funktionen mit FileIO/MuseScore-Testobjekten, drei Provider-Anfragen, Mehrblock-Antworten, Tokenlimit, Schlüsselmaskierung und 0,04792 USD für 1245/4543 Anthropic-Tokens inklusive 2969 bereits enthaltener Thinking-Tokens. QML-Start und Syntax geprüft.

Praktisch noch zu prüfen: Update auf 0.9.0, echte freie Komposition mit gespeichertem Key, „Komposition in MuseScore öffnen“, Layout/Wiedergabe/Partiturspeicherung; Import der Elegie und des Herbstlichen Abendgesangs. Besonders Pedalwechsel, Atemzeichen und Klavierstimmen in der verwendeten MuseScore-Version kontrollieren.

## 0.10.0 – drei Arbeitsweisen / alle Kompositionsmodi

Bestanden: alle 18 Modus-/Arbeitsweise-Kombinationen im tatsächlichen Qt-JavaScript, Ideen-Stopp und bearbeiteter Text in Stufe 2, getrennte Provider/Modelle/Keys, Prüfung fehlender zweiter Keys vor dem ersten Aufruf, festgehaltener Kontext, Erhalt der musikalischen Erstfassung bei Fehlern, Wiederholung der Übertragung, Stufenkosten inklusive unbekannter Modellpreise, Schutz vor mehrfach ausgelösten Netzwerkcallbacks. Die zwei bestehenden CS1-Kompositionen bleiben unverändert erfolgreich. Kombinierte Partituren, neue Parts, Fortsetzung, Leertakte, Auswahlpausen, Auftakte, Klavier-Zweisystemigkeit und klingende Tonhöhen bei B-Instrumenten gegen MusicXML 4.0 getestet. QML-Start, Rendering, Scrollbarkeit und Bearbeitung des Ideenfeldes geprüft.

Praxistest in MuseScore noch erforderlich: Update auf 0.10.0; Idee mit Modell A erzeugen, bearbeiten, mit Modell B komponieren; Musik-zuerst-Ablauf; Kontextfassungen öffnen und vor allem Fortsetzung, Partzuordnung, Ausdruck/Wiedergabe und Speicherung überprüfen. Musikalische Qualitätsvergleiche wurden nicht durch technische Tests ersetzt. Native Importtests wurden hier mit API-Testobjekten simuliert, nicht in einer installierten MuseScore-Anwendung durchgeführt.

## 0.10.2 – Starter und sichtbare Ladefehler

`python tests/test_loader.py` und `python tests/test_loader.py --qt5` prüfen den originalen Host mit dem korrigierten Settings-Testobjekt, den minimalen Starter mit der vollständigen App, Windows-/UNC-Dateipfade und die sichtbare Rückkehr bei fehlenden Dateien und fehlenden QML-Modulen. Qt 6 prüft zusätzlich die tatsächlich gerenderte Hintergrundfarbe der Fehlerfläche. Qt 5 prüft die Instanziierung und Zustände, da Window-Grab im Offscreen-Backend fehlt. Echte API-Keys und KI-Anfragen werden nicht verwendet. Ein realer Windows-11-MuseScore-Test bleibt ausstehend.

## 0.10.4 – Scrollen

Der UI-Test prüft den Haupt-Flickable mit überhohem Inhalt, einen echten Mausklick auf die vertikale Scrollleiste sowie ein Mausradereignis. Beide bewegen contentY. Der Loaderstart wird zusätzlich unter Qt 5 geprüft.

## 0.10.5 – Updatefunktion

`python tests/test_update.py` führt die echten QML-Updaterfunktionen im Qt-JS-Interpreter mit deterministischen HTTP-Antworten aus. Geprüft: einmalige Antwortverarbeitung, neuer/gleicher Versionsstand, Schreiben und Lesen unter Windows-Dateipfaden, Aktivierungsquelle sowie HTTP-Fehler mit Rücksetzung des Beschäftigtzustands. Kein externer Netzaufruf.

## 0.10.7 – Bildschirm und Fenstergröße

Der Hosttest prüft, dass die Anfangsgröße unterhalb der verfügbaren Bildschirmgröße bleibt. Mit QT_SCALE_FACTOR=1.5 wird zusätzlich der Start bei Skalierung geprüft. Der UI-Test läuft nun auch mit --qt5 und prüft eine verkleinerte Fensterhöhe (500), die zugehörige tatsächliche Scrollbereichhöhe und die Erreichbarkeit des Inhaltsendes.

## 0.10.8 – Tatsächlich beschnittene MuseScore-Einbettung

`python tests/test_clipped_window.py` erstellt einen festen 900 hohen Plugin-Elternbereich in einem 500 hohen nativen Fenster. Im unveränderten Analysemodus reproduziert Qt 6 an 0.10.7 den Fall: 850 hoher Inhalt passt in den 864 hohen Flickable, wird aber vom Fenster abgeschnitten. Auch Qt 5 reproduziert den übergroßen Viewport, mit anderen Stilmaßen. Der neue Code begrenzt den Flickable auf 464; Mausrad, Scrollleistenklick, Inhaltsende und Verkleinerung des tatsächlichen Fensters auf 400 werden unter beiden Qt-Versionen geprüft.

## 0.10.9 – Update und Wiederöffnung

`python tests/test_update_restart.py` (auch `--qt5`) verwendet die vollständigen QML-Dateien und echten Datenträgerzugriff über einen FileIO-Testadapter. Ein Update wird geschrieben, geprüft, geladen und in Active.json gespeichert. Nach Zerstörung des Pluginobjekts lädt derselbe Engine-Cache die neue Version; ein zusätzlicher Prozess lädt ebenfalls die neue Version. Veraltete Settings-Einträge werden bewusst vorgegeben und ignoriert. Ein manipulierter Datensatz mit Pfad außerhalb des Pluginordners wird abgewiesen. Keine echten Netzaufrufe oder API-Keys.

## 0.10.10 – Modellauswahl

`python tests/test_model_catalog.py` prüft die echten Modellkatalogfunktionen im Qt-JS-Interpreter mit deterministischen API-Antworten: drei Header-/Endpunktverträge, Pagination, Filter, Duplikate, eigene Modelle, keyfreier Cache, HTTP-Fehler und verspätete Antworten. Der UI-Test prüft unter Qt 5 und 6 beide echten ComboBoxes samt Auswahl, Speicherung und manuellem Modellnamen. Keine echten API-Abfragen. Der Update-Neustarttest wird für die aktuelle App-Fassung erneut ausgeführt.

## 0.10.11 – Nativer FileIO-Reader

`python tests/test_startup_record.py` reproduziert die falsche Fehlermeldung von 0.10.10 trotz erfolgreich geschriebener Aktivierung. Der aktuelle Code prüft die JSON-Werte, toleriert zusätzliche Lese-Zeilenumbrüche und erkennt weiterhin fehlgeschlagene Schreibvorgänge. Der FileIO-Adapter im vollständigen Update-/Neustarttest bildet nun MuseScores do/readLine-Schleife einschließlich des abschließenden Null-Zeilenumbruchs ab. Beide Qt-Versionen prüfen zusätzlich das Ausbleiben der falschen Fehlermeldung.
