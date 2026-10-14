# AI Notation Studio v0.10.29 – 14.10.2026

Die Notationsprüfung bereitete bereits eine korrigierte vollständige MusicXML-Partitur vor, bot in v0.10.28 aber keinen sichtbaren Weg, diese zu öffnen. Die direkte Bearbeitung verwendet native Haltebogenbefehle. Bei einem Fehler nimmt sie ihre Transaktion zurück und verwarf zusätzlich den Korrekturplan.

Der neue Button „Korrigierte Partitur öffnen“ macht den vorhandenen MusicXML-Weg zugänglich. Er prüft erneut die unveränderte Ausgangspartitur und die Gleichheit der klingenden Noten, schreibt und liest die neue Datei zur Kontrolle und öffnet sie über MuseScores readScore. Erst nach bestätigtem Öffnen wird der Plan verworfen und Erfolg gemeldet. Die Ausgangspartitur bleibt geöffnet. Nach einem Fehler der direkten Bearbeitung bleibt dieser Weg verfügbar, auch wenn native Befehle die Auswahl aufgehoben haben. Fehlermeldungen stehen direkt im Notationsbereich.

Die direkte Bearbeitung bleibt separat erhalten. Ihre konkrete native Fehlerursache auf dem Windows-System ist noch nicht belegt und wird nicht als behoben bezeichnet. Die Strukturprüfung behandelt geeignete gehaltene Bass-/Akkordpassagen, nicht sämtliche Notationsprobleme. MusicXML-Import kann MuseScores Layout, Sound-Zuordnung und Metadaten verändern; die Klangsignatur prüft Tonhöhen, Einsätze und Dauern.

Validierung: node tests/test_notation_open.js, node tests/test_notation_structure.js und node tests/test_notation_direct.js. Der neue Integrationstest verwendet den tatsächlichen QML-Funktionscode und die echte Strukturengine: Ausgabe und Klanggleichheit, Rücknahmefehler mit anschließendem Öffnen, aufgehobene Auswahl, veraltete Partitur, beschädigte Klangsignatur, Datei-/Importfehler und Wiederholung. Native MuseScore-APIs sind Testobjekte; kein bestätigter MuseScore-Praxistest in dieser Umgebung.

Oberfläche und neuer Button: Qt 5.15.11 und Qt 6.12.0 bestanden. Dauerhaftes Update und Neustart: Qt 5.15.11 bestanden; Qt 6.12.0 zeigt den bereits dokumentierten „File name case mismatch“-Fehler.
