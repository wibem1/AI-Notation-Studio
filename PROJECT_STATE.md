# Projektstand – AI Notation Studio

## Laufende isolierte Entwicklung – native Partiturübernahme (Branch, nicht Live)
- **Branch:** `feat/native-output-target-spike-20261106`, Draft-PR #3. `tests/native_measure_insertion_probe.qml` und `tests/test_native_measure_probe.cjs` angelegt, auf dem Branch gesichert; `NATIVE-OUTPUT-TARGET-SPIKE.md` enthält die Abbruch- und Qualitätsbedingungen.
- **Prüfstufe:** Sieben simulierbare JavaScript-/QML-Ausführungspfade mit Node erfolgreich geprüft. Echte native MuseScore-QML-Ausführung, zuverlässige Einfügung vor Takt 1, Noten-/Spanner-Erhaltung, Undo und Windows-UI **nicht getestet**. Daher keine Implementierung/Veröffentlichung der Option „Bestehende Partitur“.
- **Native CI-Versuch #42298512439 (06.11.2026): fehlgeschlagen vor Pluginstart.** AppImage verifiziert und Test-MSCZ erfolgreich erzeugt, aber MuseScore 4.7.6 meldete `Unknown options: no-synthesizer, p`. Kein tatsächlicher QML-Pluginlauf. Nächster Schritt: **GUI-Pluginmanager in Xvfb statt `-p`** oder API-Quellprüfung; gleicher CLI-Versuch wird nicht wiederholt. Details in `NATIVE-OUTPUT-TARGET-SPIKE.md`.
- **Nächster einzelner Schritt:** Wegwerfpartitur in echter MuseScore-4.7.6-Engine mit dem QML-Probeplugin ausführen; tatsächliche Vorher/Nachher-/Rollback-MusikXML-Dateien und Logs auswerten. Erst nach bestandenem nativen Nachweis den CS1-Transfer entwickeln.
- **Live bleibt 0.11.11**, Starter 0.7.27 unverändert; keine Änderung an Feed oder Haupt-QML.



**Live-Version 0.11.11, Stand 06.11.2026.** Der Starter 0.7.27 und ältere Versionen bleiben unverändert.

## Nächste Entwicklung: wählbares Ausgabeziel (Entscheidung 06.11.2026, Issue #2)
- Der Benutzer bestätigt: **„In bestehende Partitur einfügen“ soll später Standard sein**, alternativ **„Als neue Partitur öffnen“**, übergreifend für Vorspiel, Fortsetzung und andere KI-Kompositionen. Beide Optionen sollen auf demselben geprüften CS1/MusicXML-Ergebnis beruhen und keinen neuen KI-Aufruf auslösen.
- **Wichtiger technischer Freigabeblock:** `openCompactScore()` verwendet aktuell `readScore(...)` und erzeugt somit immer einen neuen MuseScore-Tab. Für wirkliches In-Place-Einfügen existiert kein einfacher dokumentierter Plugin-Aufruf zum Ersetzen der Partitur durch MusicXML. Vor Release muss ein natives, transaktionales Einfügen neuer Takte **und** Übernehmen aller Noten/Markierungen/Staffs implementiert und in MuseScore auf vollständiges Undo und unveränderte alte Takte getestet werden. Niemals durch Schließen/Ersetzen der Ausgangspartitur simulieren; bei fehlender Fähigkeit offen abbrechen. Aktuelle 0.11.11 bleibt deshalb unverändert. Keinen unfertigen „Standard“-Schalter veröffentlichen.
- Zusätzlich offener Notensatzfehler aus dem Screenshot: wiederholte Startangaben, getrennte Klaviernamen, Pedalposition und leerer Rahmen im importierten MusicXML; nicht mit dem Ausgabeziel vermischen.
- Verbindliche Spezifikation und Akzeptanzkriterien: https://github.com/wibem1/AI-Notation-Studio/issues/2

## Aktuell behoben: KI-Vorspiel zwar erzeugt, aber nicht übernommen
- Nutzerdiagnose v0.11.10: `workflowState=invalid`, `validation_error="Error: Rhythmus ist nicht exakt darstellbar."`, Roh-Antwort `compositionJob.raw_response` gespeichert, Ausgangspartitur unverändert bei 32 Takten.
- Ursache sind gebrochene Positionen von Pedal und Crescendo (`2.9`, `4.9`) beim MusicXML-Export, **nicht** das vorherige Problem mit dem übervollen Takt.
- Korrektur: `positionTicks` rundet nur Ausdruckspositionen zur darstellbaren Tickauflösung; Notendauern bleiben strikt. `compactscore-musicxml.js` und eingebettete QML-Engine konsistent. Instrumenten-Checkboxen haben helle Schrift statt Schwarz auf dunkel.
- Staging-Regressionslauf #42291426821 erfolgreich, echter MuseScore Studio 4.7.6 Linux XML→MSCZ→XML-Import mit Pedalmarkierungen #42291426814 erfolgreich.
- Live-Update-Feed und zwei Versionseinträge sind identisch; vorherige Versionen bleiben archiviert.
- **Nächster Schritt:** Nutzer installiert 0.11.11, wählt **„Gespeicherte KI-Antwort erneut prüfen (kostenfrei)“** und anschließend **„Fertige Fassung in MuseScore öffnen“**. Kein neuer Anbieteraufruf. Windows-Plugin-End-to-End noch nicht bestätigt.
- Details `RELEASE-0.11.11.md`, Issue #1.

## Historischer Projektstand
Stand: 06.11.2026 · **v0.11.10 über die bestehende Updatefunktion veröffentlicht**, Starter 0.7.27 unverändert.

## Aktuell – behobener Vorspiel-Fehler (echte Nutzerdiagnose)
- MuseScore Studio 4.7.6 / Windows: Original 32 Takte, Flöte, Violine, Klavier (P3) und „Klavier, Klavier LH“ (P4); die beiden Klavier-Parts enthalten je zwei Notensysteme. 0.11.9 zeigte keine übernommene Vorspielpartitur. Die vom Modell bereits gelieferte zweiteilige CS1-Musik lag in der Partitur gespeichert, aber `compositionJob.workflowState=invalid` aufgrund eines um 0,5 Viertel überfüllten zweiten Taktes in der linken Hand.
- **0.11.10 korrigiert diesen Einzelfall ohne neuen Provider-Aufruf:** Drei abschließende Achtel nach drei Vierteln im 4/4-Takt werden nachvollziehbar als 3:2-Triole interpretiert. Kein Ton wird entfernt. Die eng begrenzte MusicXML-Rückfallebene kann eine einzelne Schlussachtel als Vorschlagsnote erhalten, mit Warnung. Unpassende Rhythmen bleiben Fehler. Bestehende Originaltakte werden niemals geändert.
- Die echten P3/P4 mit je zwei Staves bleiben getrennte MusicXML-Parts, nicht fälschlich eine Zwei-Einzelstaff-Gruppe. Ein vorhandener `raw_response` ist nach Update über **„Gespeicherte KI-Antwort erneut prüfen (kostenfrei)“** wieder nutzbar; danach „Fertige Fassung in MuseScore öffnen“.
- **Tests:** `tests/test_prelude_0110_recovery.cjs`, `tests/test_prelude_user_0110.cjs`; 32→34 Takte vier Parts, Noten und alle Originaltakte erhalten. Offizielle MuseScore Studio 4.7.6 Linux AppImage importiert und reexportiert 34 Takte in vier Parts (CI #42287184798, erfolgreich). Vollständiger Test der veröffentlichten App und des Updatewegs CI #42287786062 erfolgreich. Keine kostenpflichtigen KI-Aufrufe für die Prüfung. Die persönliche Diagnose wurde nicht ins öffentliche Repository geladen.
- **Live-Feed:** `AI-Notation-Studio-App.qml`, `AI-Notation-Studio-App-0.11.10.qml`, `versions/AI-Notation-Studio-App-0.11.10.qml` identischer Git-Blob `3e5eae039d671bb89387d59788245aa4783058a8`. Frühere Versionsdateien unverändert.
- **Noch nicht bestätigt:** Ergebnis der kostenfreien Wiederholung im echten MuseScore-Windows-Plugin beim Nutzer. Nächster Schritt: Update installieren und die gespeicherte Antwort prüfen, nicht noch einmal komponieren. Dokumentation `RELEASE-0.11.10.md`.

## Frühere Entwicklungsstände
Stand: 06.11.2026 · **0.11.10 im Update-Feed, Regression bestätigt**

## Aktueller Fehlerfix: Vorspiel aus echter Nutzerdiagnose
- 0.11.9: Die KI hatte das zweitägige Vorspiel komponiert, die fertige Partitur blieb wegen eines **übervollen Taktes im zweiten Klavier-Part (4,5 statt 4/4 Viertel)** aus. In der Diagnose wurde `workflowState=invalid` mit `Vorspiel: Instrument enthält einen unvollständigen Takt` gefunden; der originale 32-Takte-Score blieb intakt.
- Der tatsächliche MuseScore-Score besitzt vier MusicXML-Parts: P1 Flöte, P2 Violine, P3 Klavier, P4 „Klavier, Klavier LH“, wobei **P3/P4 jeweils zwei eigene Systeme** haben. Das ist **nicht** der normale Zwei-Einzelstaff-Export einer einzelnen Klavierpartitur. Als separate Zielparts behandelt; die Erkennung wirklich gesplitteter Ein-Staff-Klavierparts bleibt erhalten.
- **0.11.10**: gezielte CS1-Rhythmusreparatur `repairPreludeTripletOverrun`, die in dem konkreten Ausnahmefall die drei letzten Achtel einer überlangen 4/4-Stimme als 3:2-Triole notiert, ohne einen Ton zu entfernen. Andere Unregelmäßigkeiten bleiben als Fehler sichtbar. Zusätzlich bietet der separat geprüfte MusicXML-Kern einen eng begrenzten Single-Eighth-Grace-Fallback.
- Die bereits gespeicherte KI-Antwort kann über `Gespeicherte KI-Antwort erneut prüfen (kostenfrei)` **ohne weiteren API-Aufruf** neu verarbeitet werden; anschließend `Fertige Fassung in MuseScore öffnen`. Die ursprüngliche Partitur wird nicht überschrieben.
- **Tests**: `tests/test_prelude_0110_recovery.cjs` und die übrigen Regressionen bestanden im Live-Feed `0.11.10`, https://github.com/wibem1/AI-Notation-Studio/actions/runs/42287786062. Der analoge vierstimmige 32→34-Takte-Fall bestand auch echten MuseScore-Studio-4.7.6-Import-/Export (Linux AppImage): https://github.com/wibem1/AI-Notation-Studio/actions/runs/42287184798.
- `AI-Notation-Studio-App.qml` ist auf 0.11.10 aktualisiert; `versions/AI-Notation-Studio-App-0.11.10.qml` archiviert. Originaldateien 0.11.8/0.11.9 bleiben erhalten.
- **Grenzen:** Kein bestätigter End-to-End-Test in der Windows-Plugin-Oberfläche durch Nutzer; Triole ist eine musikalische Interpretation, nicht zwingend die einzige. Die Diagnose/Originalpartitur wurde nur lokal analysiert, **nicht** ins öffentliche GitHub hochgeladen.
- **Nächster Schritt:** Benutzer aktualisiert auf 0.11.10, lässt die gespeicherte fehlerhafte Antwort kostenfrei erneut prüfen und öffnet die neue MuseScore-Partitur. Bei einem neuen Fehler aus dem Diagnoseexport die genaue Ursache eingrenzen; keine grundlose erneute KI-Generierung.
- Siehe `RELEASE-0.11.10.md` und Issue #1.

## Frühere Projektstände
Stand: 06.11.2026 · **0.11.9 freigegeben, bestehender Starter 0.7.27**

## Aktueller verifizierter Stand
- **Live-App:** `AI-Notation-Studio-App.qml` Version 0.11.9. Identisch mit `AI-Notation-Studio-App-0.11.9.qml` und `versions/AI-Notation-Studio-App-0.11.9.qml` (Git-Blob-SHA `0d96e3475bb08e2c9ff1a66afdf664f309e3aed6`). Vorversionen unverändert.
- Neuer Modus **Vorspiel voranstellen**: mehrere vorhandene Zielinstrumente und neue Taktzahl frei wählbar; Quelle ist die geöffnete Partitur, Vorspiel wird vor dem ersten Originaltakt in einer neuen MusicXML-Partitur integriert, Original bleibt unverändert. Versteckte Klavier-Folgeparts (RH/LH) werden erkannt, ohne zwei sichtbare echte Klaviere gleichzusetzen.
- **Belegt:** In der realen Qt-Quick-Engine mit MuseScore-Stubs funktioniert der neue Dialogmodus einschließlich Instrument-Repeater. CS1-Runtime mit Schema- und Part-Erhaltungstests erfolgreich. 32-taktiger synthetischer Vier-Part-Fall: 32→34 Takte, alle 32 Originaltakte über vier Parts kanonisch unverändert, unbeteiligte Violine pausiert. **Offizielle MuseScore Studio 4.7.6 Linux-AppImage** importiert die erzeugte 34-Takt-MusicXML, speichert MSCZ und exportiert MusicXML zurück: **vier Parts mit je 34 Takten**. Workflow https://github.com/wibem1/AI-Notation-Studio/actions/runs/42265598808 erfolgreich.
- Allgemeiner Versions-/Update-/Neustart-Regressionstest nach tatsächlichem Wechsel auf Live-0.11.9: https://github.com/wibem1/AI-Notation-Studio/actions/runs/42266219809 **erfolgreich**. Tests für 0.11.8-hartkodierte Annahmen aktualisiert.
- **Nicht belegt:** Windows-MuseScore-Plugin-Dialog-End-to-End, reale kostenpflichtige KI-Provider-Antwort, praktischer 32-Takte-Nutzerscore im originalen MuseScore-Fenster. Eingegrenzte Sonderfälle: Auftakt, unvollständiger Anfang, wechselnde/abweichende Taktlängen sowie komplexe polyphone Klavierhand-Aufteilung; solche Fälle werden aus Sicherheitsgründen abgelehnt.
- **Nächster einzelner Schritt:** Benutzer verwendet `Update prüfen → Update installieren` auf 0.11.9 und prüft einen kleinen realen Vorspielauftrag an einer bestehenden Partitur; bei Problemen Diagnose exportieren. Keine weiteren Entwicklungstests durch den Nutzer erforderlich, bevor ein konkreter Fehler auftaucht.
- Details: [RELEASE-0.11.9.md](RELEASE-0.11.9.md), Issue #1.

## Historie vor der Freigabe (6.11.2026)
Stand: 06.11.2026 · veröffentlichte App v0.11.8 (unverändert)

## Testergebnis 06.11.2026 – Qt und MusicXML bestanden; native MuseScore-Prüfung ausstehend
- Letzter bestätigter CI-Lauf: **GitHub Actions #42260646460, Erfolg**, SHA `d526279129fcef4d74c672e238195dc249f87620`, https://github.com/wibem1/AI-Notation-Studio/actions/runs/42260646460.
- Neues `tests/test_prelude_ui.py`: **echte Qt-Quick-Engine mit MuseScore/FileIO-Stubs** lädt die separate `AI-Notation-Studio-App-0.11.9.qml`. Modusindex 9 und Titel, zwei Instrument-Checkboxen im Repeater, Auswahlbindung sowie Ausblenden außerhalb des Modus werden geprüft. Zunächst Fehler in der Testmethodik: `QObject.findChild` findet QML-Repeater-Delegates nicht; `Repeater.itemAt()` überprüft dieselben tatsächlich vorhandenen Delegates erfolgreich. Erster fehlgeschlagener Test wurde korrigiert, danach grüner CI-Lauf.
- `tests/test_prelude_musicxml.py`: Qt-JavaScript-Runtime der eingebetteten App erzeugt via CS1 zwei Takte für Klavier; MusicXML der 18-taktigen Gesamtausgabe validiert gegen MusicXML 4.0 XSD sowohl beim einteiligen zweisystemigen Klavier als auch beim vom Plugin unterstützten getrennten Klavier-Part.
- Vorspieldauer hat nun eine eigene Voreinstellung **2 Takte**, unabhängig von der Anzahl bei freier Komposition. Zielinstrumentliste und UI-Komponenten sind für Tests eindeutig identifizierbar.
- **Präzise Qualitätsstufe:** Implementiert und in der Qt-Testengine mit MuseScore-Stubs geprüft; XSD-validierte MusicXML-Ausgabe. **Nicht** mit echtem MuseScore 4.7.6, einem konkreten API-Provider oder der Originalpartitur des Nutzers als Native-Import getestet. Daher **keine Änderung an `AI-Notation-Studio-App.qml` und keine Update-Freigabe**.
- **Nächster Schritt:** Nativen MuseScore-Import und tatsächlich ausgewählte Instrumente, Taktverschiebung sowie bestehende Stimmen an einer Testpartitur prüfen. Bei Erfolg als neuen Live-Updatefeed ausrollen und erst danach als Benutzerversion kennzeichnen. Keine kostenpflichtigen KI-Testaufrufe ohne Notwendigkeit.

## Entwicklungsfortschritt vom 06.11.2026: 0.11.9 im Staging, NICHT freigegeben
- **Veröffentlichte Version bleibt 0.11.8**; die Live-Update-Datei `AI-Notation-Studio-App.qml` wurde nicht verändert. `AI-Notation-Studio-App-0.11.9.qml` ist eine getrennte Arbeitsversion auf main, keine veröffentlichte App.
- Neue UI: Modus **„Vorspiel voranstellen“** (Index 9), wählbare Dauer in Takten, Auswahl einer oder mehrerer vorhandener Instrumentgruppen anhand der tatsächlichen MusicXML-Partstruktur. Kein markierter Taktbereich erforderlich.
- KI-Vorbereitung: Auftrag auf genau die ausgewählten Instrumente beschränkt, mit Auszug der Anfangstakte als musikalischer Kontext, ohne vorhandene Parts zu überschreiben. `prependPrelude` wird beim Kombinieren über eindeutige `targetGroups` angesprochen.
- Spezieller MuseScore-Export aus der Nutzerdiagnose: Verstecktes zweites Klaviersystem wird am Attribut **`<part-name print-object="no">`** erkannt (nicht nur am `score-part`-Element). Zuerst sichtbares, direkt folgend unsichtbares und gleich benanntes Klavier-Part mit je einem Staff wird als RH/LH-Gruppe angeboten; zwei echte gleichnamige, sichtbare Klaviere bleiben separate Ziele.
- Der MUSICXML-Kern splittet die von CS1 als ein zweizeiliger Klavierpart erzeugte Musik bei Bedarf auf zwei originale Einzelstaff-Parts und fügt die Takte vor dem bisherigen Anfang ein. Unbeteiligte Instrumente erhalten Pausen; originale Takte bleiben beim Einfügealgorithmus erhalten.
- Nachweise: `tests/test_prelude_prepend.cjs`, `tests/test_prelude_piano_split.cjs`, `tests/test_prelude_embedded_0119.cjs`. Manuelle deterministische JavaScript-Ausführung im eingebetteten QML-Runtime-Code und mit dem echten `Herbstlicher-Abendgesang.cs`-Fixture: 16→18 Takte, sowohl einem zweizeiligen Piano-Part als auch gesplitteten RH/LH-Parts; Instrumentgruppen-Erkennung und Schutzfälle bestanden. Separater Mock der `prepareCompositionJob(9)`- und `compositionTask`-Logik erfolgreich; kein kostenpflichtiger API-Aufruf.
- **NICHT geprüft:** Vollständige QML-Kompilierung in echter Qt-Engine und native MuseScore-Integration, der reale 32-Takt-Nutzerscore in MuseScore, tatsächlicher KI-Provider-Antwortablauf und das Öffnen von generierten MusicXML-Kopien. Keine Berechtigung zur Release-Freigabe aus den bisherigen Tests.
- **Nächster Schritt:** Qt-QML-Engine mit MuseScore-Stub bzw. MuseScore-Windows-Integrationstest durchführen; eventuelle UI-/Layout-/Parserprobleme korrigieren; erst nach belegten Tests Live-Update und versionierte Auslieferung gemäß `AGENTS.md`.
- Commitnachweise siehe Repositoryhistorie und GitHub Issue #1.

## Laufende Entwicklung: Instrumentunabhängiges Vorspiel (Issue #1)
- **Implementiert im separaten MusicXML-Quellmodul** `compactscore-context.js`: `prependPrelude(baseXML, addedXML, {targetPartIndices:[...]})` als transaktionsartig verifizierbare Kopier-/Einfügefunktion. Akzeptiert explizite, eindeutige Part-Indizes, unterstützt ein oder mehrere Instrumente, ergänzt vollständige Pausentakte in nicht beteiligten Parts und verschiebt sämtliche Originaltakte in einer neuen XML-Partitur. Quelle v0.11.8/QML-Updatefeed **noch nicht** geändert.
- **Statische JS-Laufzeitprüfungen (kein MuseScore):** `tests/test_prelude_prepend.cjs` mit fünf positiven Fällen (Flöte/Violine/Cello, mehrere Instrumente, Klavier als zweizeiliger Part, zwei gleichnamige Parts, gesplittetes Klavier mit zwei expliziten Zielparts) und drei Schutzfällen (ungültiger Partindex, doppelte Auswahl, Systemzahlabweichung) bestanden. Originalnoten und ursprünglicher Part-Bestand in den Prüffällen unverändert. Kein kostenpflichtiger KI-Aufruf.
- Zusätzlicher Abbruch bei einem unvollständigen Original-Anfangstakt.
- **Wichtige Grenzen:** Noch **keine** Anbindung an das Pluginfenster, die CS1-KI-Komposition oder die in v0.11.8 eingebettete Kontext-Engine, kein End-to-End-Test und kein nativer MuseScore-Test. Bestehende v0.11.8 ist die einzige installierbare Fassung. Kein Release und keine Updatefreigabe dieser Funktion.
- **Realer Fehlerfall:** Diagnose MuseScore 4.7.6 enthält P1 Flöte, P2 Violine, P3 Klavier (G-Schlüssel), P4 Klavier (F-Schlüssel), je einen MusicXML-Part/Staff. Das Einfügen kann bei expliziter Indizierung zwei erzeugte Ein-Staff-Parts in diese beiden Ziele einfügen. **Noch offen:** zuverlässige automatische Gruppierung eines gesplitteten zweihändigen Klaviers, ohne zwei echte Klaviere zu verwechseln, und Zuordnung einer CS1-Doppelstaff-Ausgabe zu zwei MusicXML-Parts.
- **Nächster überprüfbarer Schritt:** Instrumentauswahl nach expliziter Part-Identität für den Vorspielmodus und CS1-Auftragsintegration implementieren, dabei echte gesplittete Klavierparts sorgfältig behandeln; danach QML-Engine neu einbetten und mit echten MuseScore-Tests vor einer Versionserhöhung absichern.
- Weitere offengehaltene Sonderfälle: Auftakt, Taktartwechsel im Vorspiel, unvollständige Quellen, Timing-/Ausdruckszeichen und MuseScore-Layoutprüfung.
- GitHub-Issue: https://github.com/wibem1/AI-Notation-Studio/issues/1

# Vorheriger Projektstand – AI Notation Studio
Stand: 24.10.2026 · v0.11.8

## Nutzerrückmeldung und Korrektur
- v0.11.7 ist beim Nutzer angekommen. Die feste KI-/Modellanzeige ist bestätigt; Pfeiltasten-Scrollen funktioniert im echten MuseScore-Fenster nicht. Eine neue Startzeitmessung liegt nicht vor.
- Ursache im echten Qt-Fensterhost reproduziert: Hat der Fensterhost den Fokus, erreichen Key-Handler des Flickable die Pfeiltasten nicht. Der v0.11.7-Test setzte den Fokus künstlich auf das Flickable und deckte diesen Fall nicht ab.
- v0.11.8 ersetzt diesen Handler durch fensterbezogene Up/Down-Shortcuts mit Kontextprüfung. Host- und Schaltflächenfokus erlauben Scrollen; Texteditoren, Auswahlfelder, SpinBoxen und fremder Popup-/Dialogfokus behalten ihre Tastaturbedienung. QtQuick-Import 2.5 für den Shortcut-Typ erforderlich.
- Keine Änderung an Starter 0.7.27, Startkorrektur oder Modellanzeige. Neue Versionsdateien, bestehende Dateien bleiben unverändert.

## Konkrete Prüfungen
Windows, PySide6/Qt 6.12.0, Offscreen, echte Qt-Quick-Engine und echtes eigenständiges Starterfenster; vorhandene MuseScore-/FileIO-Testmodule, Disk-Roundtrip für Update und Neustart.
- Neuer tests/test_arrow_window.py gegen unveränderte v0.11.7: reproduzierbar fehlgeschlagen (Hostfokus, contentY bleibt 0).
- Derselbe Test gegen v0.11.8: Hostfokus, Schaltflächenfokus, Texteditor und modaler Dialog bestanden.
- tests/test_ui.py: Modellbindung/feste Kopfzeile, Pfeiltasten/Scrollgrenzen, Texteditor, Mausrad, Scrollleiste, Fensterverkleinerung bestanden.
- tests/test_update.py und tests/test_update_restart.py: Versionsprüfung/Installation, tatsächlicher Dateisystem-Roundtrip, Wiederöffnen im selben Cache, neuer Prozess und ungültiger Aktivierungsdatensatz bestanden. History wird beim Start nicht gelesen, bei Anforderung weiterhin schon.

## Grenzen und nächster Schritt
Kein vollständiger MuseScore-Windows-Praxistest für v0.11.8. Keine kostenpflichtigen KI-Aufrufe. Nächster Schritt: Nutzer installiert v0.11.8 per „Update prüfen → Update installieren“ und prüft Pfeiltasten außerhalb von Textfeldern.

## Arbeitsweise
Bei jeder Änderung eine neue Versionsnummer und Bereitstellung über den vorhandenen Updatefeed auf main. Alte Versionsdateien erhalten. Zentrale Standards: https://github.com/wibem1/AI-Development-Standards/blob/main/DEVELOPMENT_STANDARDS.md

