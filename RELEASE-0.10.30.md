# AI Notation Studio v0.10.30 – 14.10.2026

Die direkte Strukturkorrektur konnte Taktgrenzen-Haltebögen selbst dann ablehnen, wenn beide Takte gemeinsam zur Korrektur gehörten. Zusätzlich verwendet der alte Adapter rewindToTick, das stimmabhängig zur nächsten belegten Position springt. Die neue Fassung verwendet exakte Fraction-Positionen und erlaubt vorhandene Bogenendpunkte in allen betroffenen Takten desselben Systems. Bei Endpunkten außerhalb der tatsächlich umgebauten Passage bleibt die Bearbeitung vor jeder Änderung gesperrt.

Haltebögen werden über chord-tie an die bereits erzeugte, auf Pitch und Schreibweise geprüfte Zielnote angebunden. Ein vorhandener Bogen darf ausschließlich zu dieser Zielnote führen. Nachher werden Rhythmus, Notenzahl, Endpunkte, Wiedergabeeigenschaften und die klingenden Noten des Gesamtexports geprüft. Bei Fehlern erfolgt Rücknahme über MuseScores Transaktion. Der direkte Weg öffnet keine Partiturkopie und verwendet keine Zwischenablage.

Automatisch bestanden: tests/test_notation_direct.js (einschließlich exakter Positionierung und Zwei-Takt-Bögen), test_notation_structure.js, test_notation_open.js, test_ui.py --qt5 und test_update_restart.py --qt5. Die Qt-Tests verwenden MuseScore-Testobjekte. Das Neustartverfahren prüft 0.10.29 → 0.10.30; Starter 0.7.22 enthält 0.10.30.

Native MuseScore 4.7.0, Linux AppImage: Cursor-Anforderung 240 erreicht mit dem alten Verfahren 720, mit Fraction-Verfahren 240. Zwei-Takt-Fall: hochgeladene 0.10.28 lehnt den über beide betroffene Takte verlaufenden Bassbogen vor der Bearbeitung ab; neuer Adapter meldet Erfolg. Der echte Export enthält die gebündelte Stimmenstruktur mit identischen klingenden Tonhöhen, Einsätzen und Dauern. Eine erneute Strukturprüfung meldet keine weitere Korrektur.

Native Testgrenze: Der API-v1-Kommandozeilen-Makroprozess bricht beim Beenden mit double free/corruption ab. Ein Kontrollmakro mit startCmd, escape und endCmd ohne Notenbearbeitung zeigt denselben Absturz. Das beweist keine stabile vollständige GUI-Ausführung; der Windows-4.7.5-Praxistest steht aus. Der synthetische Ein-Takt-Fall gelingt auch mit dem alten Adapter und belegt deshalb nicht den konkreten Windows-Fehler. Die tatsächliche Schneewittchen-Partitur war nicht Teil des Tests.

Quellen der API-Verträge: MuseScore v4.7.0 src/engraving/api/v1/cursor.cpp, score.cpp und selection.cpp; src/engraving/editing/edit.cpp; src/notationscene/internal/notationactioncontroller.cpp. Keine MuseScore-Quelltexte sind in diesem Release kopiert.
