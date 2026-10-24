# Projektstand – AI Notation Studio
Stand: 24.10.2026 · v0.11.7

## Aktuelle Änderung
- Start liest den vollständigen Kompositionsverlauf nicht mehr ein. Er wird weiter beim Öffnen des Verlaufs und vor dem Archivieren gelesen. Anlass: ca. 60 MB große lokale History und vom Nutzer gemeldete ca. 20 Sekunden bei jedem Öffnen.
- Feste Anzeige von Anbieter und Modell oberhalb der Scrollfläche; aktualisiert sich mit der Auswahl. Separates Stufenmodell wird zusätzlich angezeigt.
- Unmodifizierte Pfeiltasten scrollen den Hauptbereich in 48-Pixel-Schritten. Texteditoren und bereits verarbeitete Tastaturereignisse behalten ihre Bedienung.
- Updatefeed und neue versionierte Dateien tragen v0.11.7. Starter 0.7.27 bleibt unverändert.

## Prüfgrundlage
Windows, Python 3.12, PySide6 / Qt 6.12.0, echte Qt-Quick-Engine im Offscreen-Modus; MuseScore-API und FileIO durch vorhandene Testmodule ersetzt, Update-Neustarttest mit echtem Dateisystem.
- tests/test_ui.py: Oberfläche lädt, Live-Modellanzeige, feste Kopfzeile, Up/Down einschließlich Scrollgrenzen, Cursor in Textfeld, Mausrad, Scrollleiste und Fensterverkleinerung bestanden.
- tests/test_update.py: Updateprüfung, Versionsvergleich, Installation und HTTP-Fehlerbehandlung bestanden.
- tests/test_loader.py: Fensterhost, Schließen/Wiederöffnen, Pfade und Ladefehler-Rückfall bestanden.
- tests/test_startup_record.py: Aktivierungsdatensatz und Schreibfehlerprüfung bestanden.
- tests/test_clipped_window.py: Scrollfläche bleibt bei kleinerem nativen Fenster erreichbar.
- tests/test_update_restart.py: Update mit Datei-Roundtrip, Wiederöffnen im selben Cache, neuer Prozess und ungültiger Aktivierungsdatensatz; zusätzlich kein History-Lesen beim Start und erfolgreiches Lesen auf Anforderung.

## Grenzen und nächster Schritt
Kein vollständiger Windows-MuseScore-Praxistest und keine neue Zeitmessung der gemeldeten 20 Sekunden. Keine kostenpflichtigen KI-Aufrufe. Nächster Schritt: v0.11.7 über „Update prüfen → Update installieren“ in MuseScore testen; Startdauer, Kopfzeile und Pfeiltasten vom Nutzer bestätigen lassen.

## Verbindliche Arbeitsweise
Jede Änderung erhält eine neue Versionsnummer und wird über den bestehenden Updateweg veröffentlicht; alte Versionsdateien bleiben reproduzierbar erhalten. Zentrale Standards: https://github.com/wibem1/AI-Development-Standards/blob/main/DEVELOPMENT_STANDARDS.md

