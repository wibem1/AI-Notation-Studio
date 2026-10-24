# Projektstand – AI Notation Studio
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

