# Projektstand – AI Notation Studio

## Live 0.11.13 – reale Vorspiel-Diagnose und Pfeiltasten behoben (07.11.2026)

- **Realer Fehlerbefund 0.11.12:** Die Antwort war erzeugt, aber `workflowState=invalid`, `validation_error=Vorspiel: Notensystemzahl von Zielinstrument und Komposition stimmt nicht überein`. Drei Originalparts mit 1/2/1 Systemen; beide Piano-Parts ausgewählt. Antwort: ein leerer Piano-Part und ein kompletter zweihändiger Piano-Part; dieser lag fälschlich auf dem einzeiligen Ziel. Kein bloßes Problem des Übernahmebuttons.
- **Korrektur:** eng begrenzte, rein lokale Neuordnung nur bei zwei explizit ausgewählten Piano-Zielen mit eindeutig 2/1 Systemen, einem vollständig pausierenden einzeiligen Quellstrom und einem vollständigen zweihändigen Quellpart. Aktive Musik auf das einzige passende zweisystemige Ziel; stiller zusätzlicher Part erhält passende Pausentakte. Alle musikalischen Ereignisse/Markierungen bleiben erhalten. Mehrdeutige aktive Konstellationen oder andere Instrumente werden weiterhin abgelehnt.
- **Stimmnummern:** neue Prefix-Stimmen übernehmen passende IDs des Originalparts. Dadurch erzeugt MuseScores MusicXML-Import keine zusätzliche leere LH-Stimme neben der alten.
- **UI:** `refreshCompositionJob` veröffentlicht nach Zustandsänderungen ein neues JS-Objekt, damit QML Fehler-/Retry-Steuerungen tatsächlich aktualisiert. Konkreter Fehler sichtbar. Up/Down-WindowShortcuts ignorieren schreibgeschützte Ergebnisfelder als Editor-Sperre; echte Editoren/Dropdowns/Popups behalten die Pfeile.
- **Neue-Fenster-API:** MuseScore 4.7.6 `EngravingPluginAPIHelper::readScore` startet ggf. einen separaten Prozess, gibt aber den Quellscore des bisherigen Kontexts zurück. Keine Ergebnis-Metadaten auf diesem Original setzen; Status meldet die Übergabe an das neue Fenster. Ein nativer Test wird deshalb im neuen Fenster selbst nochmals ausgeführt.
- **Prüfnachweise:** private Originaldiagnose lokal 32→34, alle 96 ursprünglichen Part-Takte als XML unverändert. Ausschließlich synthetischer analoger Fall in öffentlichem CI. Erfolgreicher echter MuseScore-GUI-Lauf **#42359032044** exportiert die neue 34-Takt-Partitur und bestätigt Originalnoten, beide Klavierhände, Pedal, Crescendo und Bögen. Vollständige Regression **#42359032055** erfolgreich; inklusive readonly-Pfeiltasten, Kostenfrei-Retry, Update/Neustart und Schutz vor falschem Ergebnis-Metadatenstempel. Codecommit `e1b59ae`.
- **Auslieferung:** `AI-Notation-Studio-App.qml`, `AI-Notation-Studio-App-0.11.13.qml` und `versions/AI-Notation-Studio-App-0.11.13.qml` identischer geprüfter Code. Starter/ältere Versionen unverändert.
- **Nutzerschritt:** Update installieren → gespeicherte Antwort kostenfrei erneut prüfen → für dieses G-Dur-Vorspiel mit Ausdruckszeichen ausdrücklich „Neue Partitur“ → „Fertige Fassung übernehmen“. Kein erneuter KI-Aufruf erforderlich.
- **Weiterhin offen:** voller nativer Transfer neuer Ausdruckszeichen, rhythmischer Sonderfälle, weiterer Ton-/Taktarten und weiterer Bearbeitungsmodi. Die Profilgrenzen aus 0.11.12 bleiben bestehen. Kein vollständiger Windows-End-to-End-Nachweis. Issue #2 bleibt offen.
- Details: [RELEASE-0.11.13.md](RELEASE-0.11.13.md).

## Frühere Projektstände

## Live 0.11.12 – begrenzte Ausgabeziel-Vorabfassung (07.11.2026)

Auf ausdrücklichen Veröffentlichungsauftrag ist die abgesicherte Teilfunktion über den vorhandenen Updatefeed bereitgestellt. **Kein Abschluss der vollständigen Anforderungen aus Issue #2.**

- **Ausgeliefert:** gespeicherte Auswahl „Bestehende Partitur (Standard) / Neue Partitur“. Gemeinsames validiertes Ergebnis, kein neuer Provideraufruf beim Zielwechsel. Native Einfügung einfacher Vorspiele in derselben Partitur, ein Undo; keine stille Ersatzöffnung. Alle Laufzeitfunktionen sind in der App-QML eingebettet.
- **Geprüft:** echte MuseScore-Studio-4.7.6-Linux-GUI mit tatsächlicher Vorschau-App und Übernahme-Schaltfläche, vollständiger Quell-Guard und Zuordnung aus demselben MusicXML wie beim Kopierweg. Zwei neue Takte, 3 Klavierstimmen/22 exakt erwartete Ereignisse; Originaltakte und Ausdruckszeichen erhalten; Undo und Ablehnung nicht unterstützter neuer Pedalzeichen. **Run #42356107868 erfolgreich**, Code `22bda28`.
- **Regressionsfreigabe:** vollständige vorhandene JavaScript-/Python-/Qt-Suite einschließlich Update/Neustart, Run #42356107961 erfolgreich. Der frühere native Writer-Test #42352037957 belegt zusätzlich Fehler-Rollback nach Teilbeschriftung. Keine kostenpflichtigen API-Aufrufe.
- **Wichtig für den Updater:** `AI-Notation-Studio-App.qml`, `AI-Notation-Studio-App-0.11.12.qml` und `versions/AI-Notation-Studio-App-0.11.12.qml` enthalten exakt denselben geprüften Code. Starter 0.7.27 und alle älteren Versionsdateien unverändert.
- **Begrenztes Profil:** vollständige 4/4-Vorspieltakte in C-Dur mit Noten/Akkorden/Pausen/Punktierungen; Originalanfang ebenfalls C-Dur/4/4. Klaviersysteme werden aus dem bereits validierten MusicXML übernommen, nicht neu aus Anzeigenamen oder Tonhöhen erraten. Arrayartige echte QML-Partlisten unterstützt.
- **Offen:** neue Pedal-/Dynamik-/Tempo-/Spannerzeichen, Tuplets/Vorschläge/Bögen, weitere Ton-/Taktarten, geteilte Klavierparts, native Fortsetzung/Variation/Ersetzen und vollständiger Windows-End-to-End-Test. Solche Fälle werden vor Mutation abgelehnt; „Neue Partitur“ bleibt ausdrücklich wählbar. Hinweistext steht in der App. Issue #2 bleibt offen.
- **Nächster Entwicklungsschritt:** den nativen Writer um verlustfreie neue Ausdruckszeichen und rhythmische Sonderfälle erweitern, dann weitere Modi anbinden und nativ prüfen.
- Installation und genaue Nachweise: [RELEASE-0.11.12.md](RELEASE-0.11.12.md).

## Entwicklungsprotokoll vor der Vorabveröffentlichung

## 07.11.2026 – Gemeinsames Ausgabeziel als abgesicherte Staging-Oberfläche (nicht freigegeben)
- Nach dem erfolgreich nativ getesteten begrenzten polyphonen Writer (#42352037957) wurde `native-prelude-target-map.js` ergänzt: strikt lesende Zuordnung von Quell-Part-ID zu realem MuseScore-Partindex, Instrument-ID, Staff/Voice/Track mit Schutz vor Mehrdeutigkeit. **Bei zweisystemigem Klavier ist eine EXPLIZITE Stimmen-/Systemzuordnung erforderlich**; aus Stimmentiteln oder Tonhöhen wird sie nicht erraten. Geteilte Original-Klavierparts sowie nicht eindeutige Konstellationen werden abgelehnt.
- **Staging-App nur im Testbereich**: `tests/AI-Notation-Studio-App-native-output-staging.qml` hat eine gespeicherte Auswahl „Übernehmen in: Bestehende Partitur (Standard) / Neue Partitur“. „Neue Partitur“ verwendet die bisherige `openCompactScore()`-Route. „Bestehende Partitur“ verwendet dasselbe bereits geprüfte `compositionJson`, prüft Workflow-Guard, Parts und jede Schreibfähigkeit **vor** Mutation und ruft den isolierten Writer nur für sein geprüftes **begrenztes** Vorspielprofil auf. Keine automatische Ersatzöffnung einer neuen Partitur bei Ablehnung, kein neuer Provideraufruf. Metadaten außerhalb der nativen Transaktion werden nicht geschrieben. Andere Bearbeitungsmodi werden in der Staging-Fassung sichtbar abgewiesen, statt ein unerprobtes Ziel vorzutäuschen.
- **Tests erfolgreich:** Node-Tests für eindeutige Bindung mit 13 bewusst ungültigen Fällen und unveränderten Daten sowie statische Staging-Routenprüfung (#42355115268). Reale Qt-Quick-Engine mit MuseScore-Stubs lädt die separate Staging-App, prüft die sichtbare Auswahl und die Voreinstellung „Bestehende Partitur“ (#42355163062). **Dies ist kein echter MuseScore-End-to-End-Test des integrierten Ausgabeziel-Dialogs.**
- **Nicht releasefähig:** Neue Pedal-, Dynamik- und Spannerereignisse, Tuplets, Vorschläge, Bindungen, andere Ton-/Taktarten und mehrdeutige Klaviersysteme werden vom Writer abgewiesen; Fortsetzung/Variation/Ersetzen sind noch nicht an den nativen Writer gebunden. Windows-End-to-End und ein Vergleich der vollständigen realen Nutzerpartitur fehlen. Die Staging-QML ist nicht mit dem Live-Updater verbunden. Diese offenen Punkte dürfen nicht durch eine Neupartitur-Scheinlösung umgangen werden.
- **Nächster einzelner Schritt:** zunächst den erweiterten Writer für verlustfreien Transfer neuer Ausdruckszeichen/Pedal und komplexer Rhythmen mit echtem MuseScore testen; danach realen End-to-End-Test der Staging-UI einschließlich Originalvergleich und Undo und anschließend die Modi anbinden. Erst dann Ausgabeziel-Option als reguläres Update freigeben.
- **Unverändert:** Live 0.11.11, Starter 0.7.27, Versionsarchiv, Updater. Draft-PR #3 ungemergt.


## 07.11.2026 – Mehrstimmiger CS1-Writer in echtem MuseScore bestanden
- **Implementiert:** separates Entwicklungsmodul `native-prelude-writer.js`. Rein lesende Vorprüfung, explizite Zuordnung der Quellparts/-stimmen zu realen Zielparts (startTrack/endTrack/instrumentId), beiden Klaviersystemen und MuseScore-Stimmen. Vollständige 4/4-Takte in C-Dur mit Noten, Akkorden, Pausen, Punktierungen und erhaltener enharmonischer Schreibweise; ein gemeinsamer nativer Änderungsbefehl.
- **Echter MuseScore-Studio-4.7.6-Linux-GUI-Test erfolgreich:** [Actions #42352037957](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42352037957), Codecommit `35d61d8`. Aus 4 vorhandenen Ensembletakten werden 6 Takte in derselben Testpartitur: zwei neue Klaviertakte, RH mit zwei Stimmen und LH separat, 22 exakt erwartete rhythmische Ereignisse, Dreiklänge, weitere Akkorde, Pausen, Punktierung und Fis. Die unbeteiligte Flöte erhält zwei Pausentakte.
- **Unabhängiger MusicXML-Nachweis:** neue Einsätze, Dauern, System-/Stimmzuordnung und Akkordtöne gegen einen von Hand vorgegebenen Erwartungsplan verglichen. Originaltakte aller Parts samt Noten, Tempo, Dynamik, Pedal, Crescendo und wirksamen Schlüssel-/Taktartangaben bleiben musikalisch unverändert. **Ein** natives Undo stellt den ursprünglichen musikalischen Zustand wieder her.
- **Fehlerpfad nativ geprüft:** absichtlicher Abbruch nach bereits geschriebenen Akkorden/Pausen (15. exakte Cursorpositionierung). `endCmd(true)` entfernt alle Teilnoten und beide neuen Takte; der vollständige musikalische MusicXML-Vergleich des Rollbackzustands besteht. Danach normaler Schreibtest erfolgreich.
- **Lokale Prüfungen:** CS1-Plan mit 13 ungültigen Fällen bestanden, keine Mutation bei Ablehnung. Drei Komparator-Regressionstests bestanden: äquivalente MusicXML-divisions bleiben gleich; falsche Dauer/Offset/Backup, Tonhöhen, Ausdruckswerte, Schlüssel und Taktart werden weiterhin erkannt.
- **Wichtige API-Erkenntnisse:** Bereichsauswahl vor `startCmd`; zwischen Einfügungen eine echte Pause des neuen Anfangstakts über `selection.select` wählen. `selectRange` innerhalb offener Transaktion arbeitet verzögert und kann die Einfügung abstürzen lassen; nur die automatische Auswahl nach `insert-measure` reicht für einen zweiten Befehl nicht. Bei neuen Achteln ändert MuseScore MusicXML-divisions global (1→2); der Vergleich normalisiert exakte Zeitbrüche statt musikalisch identische Rohdauern als Fehler zu werten. Die hierfür fehlgeschlagenen Läufe #42351514119/#42351711757/#42351868202 sind keine Freigaben; erst der abschließende Lauf ist erfolgreich.
- **Noch nicht implementiert/freigegeben:** neue Ausdruckszeichen einschließlich Pedal, Tuplets, Vorschläge, Bindungen, andere Takt-/Tonarten, automatische Zuordnung zum gemeinsamen MusicXML-Ergebnis, weitere Bearbeitungsmodi, Ausgabeziel-UI und Windows-End-to-End. Solche neuen CS1-Inhalte werden vor Mutation ausdrücklich abgelehnt, nicht verworfen. Das Modul ist **nicht** in die Live-App eingebunden.
- **Nächster Schritt:** den begrenzten Writer um die verlustfreie Übernahme neuer Ausdruckszeichen und rhythmischer Sonderfälle erweitern und nativ prüfen, bevor die gemeinsame Auswahl „Bestehende Partitur / Neue Partitur“ produktiv angebunden wird.
- Live **0.11.11**, Starter und Updatefeed unverändert; Draft-PR #3 bleibt ungemergt. Keine Versions- oder Downloadfreigabe.


## 07.11.2026 – Erster nativer Noten-Writer ausgeführt und unabhängig geprüft
- **Echter MuseScore-Studio-4.7.6-Linux-GUI-Test bestanden:** [Actions #42346246474](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42346246474), Commit `7e95138`. Neue isolierte Action `native-first-note-probe.yml` startet das vorhandene Testplugin über das echte Plugins-Menü auf der komplexen Wegwerfpartitur (Flöte, zweisystemiges Klavier, 2 Parts/3 Staves). Ergebnis: ein neuer Anfangstakt plus C5-Viertel auf Staff 0/Voice 0; **ein** natives Undo entfernt Takt UND Note.
- Die nativen Vorher/Commit/Undo-MusicXML-Dateien sind als [Run-Artefakt](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42346246474/artifacts/13563856973) gesichert. Der unabhängige Vergleich bestand in CI. Zusätzlich wurden dieselben tatsächlichen Exporte heruntergeladen und mit dem **verschärften** Komparator erneut lokal erfolgreich verglichen: vollständige hierarchische Noten-/Richtungsdaten einschließlich Dynamikwert, Tempo, Pedal, Akkordzugehörigkeit, Stimme, System, Backup/Forward und Instrumentidentität. Ausschließlich grafische Richtungskoordinaten werden ignoriert. Neue Note auch anhand MusicXML-divisions als exakte Viertel geprüft.
- `tests/test_native_note_comparator.py`: 2 lokale Tests mit 8 gezielt verfälschten musikalischen Fällen sowie Layout-/Text-Abgrenzung bestanden. Fehlerpfad der isolierten Probe verhindert nun ein versehentlich zweites Undo nach bereits erfolgter Rücknahme. Auch der abschließende native Lauf [#42346456262](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42346456262) gegen Commit `2114278` ist erfolgreich: echter QML-Schreibtest, verschärfter MusicXML-Vergleich und Ein-Schritt-Undo bestanden. Zwei zusätzlich lokal simulierte Exportfehler (vor und nach Undo) bestätigten genau eine Rücknahme, niemals ein zweites Undo.
- **Grenze:** Der Writer schreibt weiterhin genau **eine** Testnote, keinen vollständigen CS1-Inhalt. Erhaltung vorhandener Polyphonie/Pedal/Dynamik ist nachgewiesen; **Erzeugung** neuer mehrstimmiger Musik, Akkorde, Pausen, Tuplets und Ausdruckszeichen noch nicht. Keine gemeinsame Ausgabeziel-UI und kein Windows-End-to-End-Nachweis. Deshalb weiterhin keine Release-Freigabe und keine Änderung an Live 0.11.11/Starter/Updatefeed.
- **Nächster konkreter Schritt:** nativen Transfer eines begrenzten, vor Mutation vollständig validierten mehrstimmigen CS1-Taktplans (beide Klaviersysteme, Akkorde und Pausen) in derselben Transaktion implementieren und über exakte erwartete Ereignisse sowie Ein-Schritt-Undo in MuseScore prüfen; nicht erneut nur Leertakte testen.


## 07.11.2026 – Komplexer nativer Erhaltungstest bestanden; erster Noten-Writer als isolierte Probe erstellt
- **Verifizierter Erfolg:** GitHub Actions [#42310093378](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42310093378) ist erfolgreich abgeschlossen. MuseScore Studio 4.7.6 (Linux, echte GUI/Plugin) hat bei 2 Parts und 3 Staves (Flöte, zweisystemiges polyphones Klavier) einen Takt vorangestellt. Der externe MusicXML-Vergleich bestätigte Erhaltung von Noten, RH-Stimme 2, LH, Tempo, Dynamik, Pedal und Crescendo in den verschobenen Originaltakten sowie exakte Rücknahme per offenem Rollback und **einem** nativen Undo nach Commit. Vergleich ignoriert ausschließlich grafische Richtungskoordinaten. **Geprüft wurde weiterhin nur die Einfügung eines LEEREN Taktes, nicht der Writer.**
- **Neue, NICHT AUSGEFÜHRTE Writer-Probe:** `tests/native_first_note_probe.qml` in isoliertem Branch erstellt (Commits `fca71ec`, `73e45a1`). Bei ausdrücklich als `ANS-TEST-*` markierter synthetischer 4-Takt-/3-Staff-Partitur soll sie einen Takt voranstellen und über `Cursor.setDuration(1,4)` + `Cursor.addNote(72,false)` exakt eine C5-Viertelnote auf Staff 0/Voice 0 schreiben. Danach beendete Native-Transaktion, MusicXML-Export, ein Undo und erneut Export. Fehler sollen Rollback/Undo auslösen; ausschließlich Wegwerfpartitur verwenden.
- `tests/verify_native_first_note.py` (Commit `b52499f`) prüft separat, dass die neue C5-Viertelnote im ersten Takt liegt, alle alten Takte/Parts erhalten bleiben und Undo den Ausgangszustand wiederherstellt. **Noch nicht ausgeführt oder nativ bestätigt.** Dokumentierte Cursor-API: `setDuration`, `addNote`, `staffIdx`, `voice`; deren konkretes Zusammenspiel in MuseScore 4.7.6 ist erst zu testen.
- **Nächster einzelner Schritt:** isolierten Ein-Noten-Test in echter MuseScore-4.7.6-GUI mit Wegwerfscore ausführen und unabhängigen XML-Vergleich prüfen. Erst danach die Übertragung weiterer Stimmen, Akkorde, Pausen, Tuplets und Ausdruckszeichen entwickeln. Kein produktiver CS1-In-Place-Writer, keine UI-Umschaltung, kein Windows-End-to-End-Test.
- **Live 0.11.11, Updater, Starter unverändert.** Draft-PR #3 bleibt ungemergt; keine Release-Freigabe.


## Komplexer nativer Integritätstest: echte MuseScore-Ausführung, Koordinatenvergleich korrigiert (07.11.2026)
- **GitHub-Actions-Lauf #42309676635**: Fixture-Generator, XML-Strukturvorprüfung, MuseScore-4.7.6-MusicXML-Import und QML-Plugin tatsächlich erfolgreich ausgeführt. Native Probe meldet 4→5 Takte bei 3 Staves; Rollback und Ein-Schritt-Undo melden jeweils 4 Takte. **Gesamtlauf FAILURE**, weil der externe MusicXML-Komparator beim ersten Part eine rein grafische Änderung am Tempo-Metronom-Eintrag als musikalischen Fehler wertete (Attribut `default-x=-37.68` vor Einfügung, danach nicht vorhanden). Noten und Tempo waren in der protokollierten ersten Abweichung identisch; weitere Abweichungen noch nicht ausgeschlossen.
- **Gezielter Fix Commit `be39486`**: `tests/verify_native_measure_snapshots.py` ignoriert bei Richtungs-/Ausdrucks-XML nur die positionsbezogenen Attribute `default-x/default-y/relative-x/relative-y`; Text, musikalisch relevante Attribute und `sound` bleiben vergleichspflichtig. Keine Änderung am produktiven Plugin oder am nativen Takteinfügecode.
- **Automatisch gestarteter Folgelauf #42310093378**; beim letzten Abruf noch `in_progress` (GUI-Abhängigkeiten). **Kein Erfolgsnachweis des komplexen Vergleichs**, bis dieser Lauf endet und seine Artefakte geprüft sind.
- **Nächster einzelner Schritt:** Ergebnis von #42310093378 auswerten. Bei Erfolg den Bereich der nachgewiesenen Erhaltung präzisieren und anschließend den separaten Writer für KI-generierte Takte konzipieren/isoliert prüfen. Bei Fehlschlag den konkreten musikalischen Unterschied untersuchen. Live 0.11.11 und Updater weiterhin unverändert, Draft-PR #3 offen.


## Fortsetzung – strukturierte Fixture-Vorprüfung ergänzt (07.11.2026)
- Der zuvor identifizierte Python-3.14-Serialisierungsfehler wurde im isolierten Branch behoben (Commit `5735edd`).
- Der native Testworkflow prüft jetzt nach dem Erzeugen der MusicXML die XML-Syntax, 2 Parts mit je 4 Takten, 8 Backup-Vorgänge, zwei Pedalmarkierungen, zwei Crescendo-Klammer-Markierungen und Tempodaten **vor** Import und GUI-Pluginstart (Workflow-Commit `ef41044`). Außerdem reagiert der Branch-Workflow explizit auf Änderungen der Testfixture und des Vergleichsskripts.
- **Prüfstatus:** Commit gespeichert; ein neuer GitHub-Actions-Lauf für `ef41044` war beim Nachsehen noch nicht gelistet. Der komplexe native Integritätsnachweis steht deshalb weiterhin aus. Die Vorprüfung darf nicht als bestanden bezeichnet werden, bevor ein Lauf dies bestätigt.
- **Nächster Schritt:** den Run zum Commit `ef41044` auswerten, gegebenenfalls genau einen manuell ausgelösten Branch-Workflow starten, bei Fehlschlag anhand des ersten konkreten Fehlers korrigieren. Danach erst sichere CS1-Datenübertragung implementieren.
- **Schutz:** Live-Version 0.11.11, Starter und produktiver Update-Feed unverändert, Draft-PR #3 ungemergt.


## Komplexer nativer Test: Infrastrukturfehler präzisiert und Fixture korrigiert (06.11.2026)
- GitHub Actions #42306437542 ist **fehlgeschlagen vor dem MuseScore-Import**. Der Runner installierte GUI-Abhängigkeiten und lud die offizielle MuseScore-4.7.6-AppImage erfolgreich herunter; dann brach `tests/generate_native_complex_fixture.py` bei `ET.tostring` ab: `TypeError: cannot serialize 84 (type int)`. Ursache: numerisches XML-Attribut `sound tempo=84`, das Python 3.14 nicht serialisiert.
- Gezielte Korrektur Commit `5735edd`: der zentrale `sub()`-Helfer konvertiert XML-Attributwerte mit `str(value)`; musikalische Testdaten und produktive Dateien unverändert. **Noch kein neuer nativer Lauf und kein erfolgreicher komplexer Test bestätigt.**
- Nächster einzelner Schritt: komplexe Fixture unter Python 3.14 erzeugen und deren XML-Syntax validieren, danach genau einen nativen MuseScore-4.7.6-Integritätstest für 2 Parts/3 Staves, Stimmen, Tempo, Dynamik, Pedal und Crescendo ausführen und alle MusicXML-Snapshots vergleichen. Erst danach Transfer-/UI-Implementierung erwägen.
- Live 0.11.11, Starter und Updater unverändert; Draft-PR #3 ungemergt.


## Erweiterter nativer Integritätstest – komplexe Partitur (06.11.2026)
- Auf dem isolierten Branch erzeugt `tests/generate_native_complex_fixture.py` jetzt eine Wegwerfpartitur für Flöte und zweisystemiges Klavier, rechte Hand mit zwei Stimmen sowie Tempo, Dynamik, Pedal und Crescendo. `tests/verify_native_measure_snapshots.py` vergleicht musikalische Ereignisse für beide Parts in abgeschlossener Einfügung, Rollback und Ein-Schritt-Undo. Die GitHub-Action nutzt diese Fixture statt vier identischer bzw. einstimmiger Takte.
- **Prüfstufe:** Implementiert und auf GitHub gesichert; die sieben simulierten Sicherheitsprüfungen in CI liefen erfolgreich. **Kein nativer komplexer Prüfungserfolg behauptet.** Erster komplexer Run https://github.com/wibem1/AI-Notation-Studio/actions/runs/42306437542 blieb bei der Installation der Linux-GUI-Abhängigkeiten hängen (Status beim Eintrag noch in Bearbeitung). Ergebnis des eigentlichen Plugin-/XML-Tests nicht bekannt.
- **Nächster Schritt:** Dieser eine CI-Lauf auswerten; bei Infrastrukturfehler erst die Umgebung beheben, dann **ein** gezielter nativer komplexer Integritätstest. Bei gefundenem Musikdatenverlust zuerst Fehler eingrenzen, nicht freigeben. Unveränderte Live-Version 0.11.11.


## Native Einfügeposition, Notenerhaltung und Ein-Schritt-Undo nachgewiesen (06.11.2026)
- **Echter MuseScore-Studio-4.7.6-Linux-GUI-Lauf**: https://github.com/wibem1/AI-Notation-Studio/actions/runs/42302624344, isoliertes QML-Testplugin auf Wegwerfpartitur, sieben Mock-Sicherheitstests und externer MusicXML-Vergleich erfolgreich.
- Aus vier voneinander unterscheidbaren Ursprungstakten mit Noten C–D–E–F wurde **Leertakt–C–D–E–F**, die vier ursprünglichen Noten blieben in der Reihenfolge unverändert erhalten. Native MusicXML-Snapshots aus `writeScore` **nach Abschluss** der Transaktion belegen die Verschiebung.
- **Zwei Rücknahmewege bestanden:** `endCmd(true)` während offener Transaktion und, nach `endCmd(false)`, **ein** `cmd("action://notation/undo")`. XML-Signaturen danach wieder C–D–E–F; Taktzahl jeweils vier. Das generische `cmd("undo")` war wirkungslos; dokumentierte und bereits in App genutzte Aktion korrigiert.
- MuseScores `writeScore` während noch laufender Transaktion exportierte zuvor vier statt fünf Takte; für gültige Vergleiche daher **ausschließlich** den fertig abgeschlossenen Stand exportieren.
- **Grenze:** Einzelpart, Einzelstaff, ganze Noten ohne Stimmenüberlagerung, Tuplets, Pedal, Tempo, Dynamik, Spanner oder Layoutmarkierungen. Kein realer Windows-End-to-End-Test, kein CS1-In-Place-Writer, keine neue Auswahloption freigegeben.
- **Nächster einzelner Schritt:** strukturell reichhaltige Wegwerfpartitur (zwei Staves, mehrere Stimmen, Pedal/Tempo/Spanner) mit denselben nativen XML-Integritätsprüfungen testen; danach erst Writer entwickeln. `0.11.11`, Starter und Live-Feed unverändert.


## Erster echter nativer Einfüge-/Rollback-Nachweis (06.11.2026)
- **Erfolgreicher GitHub-Actions-Lauf:** https://github.com/wibem1/AI-Notation-Studio/actions/runs/42300323853, originale MuseScore Studio 4.7.6 Linux AppImage unter Xvfb, QML-Plugin tatsächlich über das Plugins-Menü aufgerufen (ActionsDispatcher loggt `action://extensions/v1/native_measure_insertion_probe.qml?action=main`).
- **Direkt aus Plugin-Protokolldatei `/tmp/ans-native-result.txt`:** `START`; vor Befehl 4 Takte/1 Staff; nach `cmd('insert-measure')` 5 Takte/1 Staff; nach `endCmd(true)` 4 Takte/1 Staff; `PASS`. Damit ist die *ausgeführte* native Taktzahl-Änderung mit Rollback belegt, nicht bloß eine JS-Simulation.
- **Ausdrücklich NICHT belegt:** tatsächliche Einfügeposition vor dem ersten Takt, vollständige Identität bestehender Noten, Stimmen/Spanner/Pedal/Tempi, 32→34-Ensemble und Windows-End-to-End. Ein Zähltest allein ist hierfür nicht ausreichend.
- **Nächster einzelner Entwicklungsschritt:** MusicXML-Snapshots aus der nativen Engine **vor**, **während** und **nach** der Transaktion exportieren und extern alle originalen Noten-/Taktereignisse auf exakte Verschiebung und vollständige Rücknahme prüfen. Bei Erfolg Polyphonie/Mehrstaffs hinzufügen, danach Kompositions-Transfer.
- Live `0.11.11`, Updater und Starter bleiben unverändert; Draft-PR #3 bleibt ungemergt.


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

