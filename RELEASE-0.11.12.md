# AI Notation Studio 0.11.12 – begrenzte Vorabfassung, 07.11.2026

## Installation

Im vorhandenen Plugin **Update prüfen → Update installieren**. Starter 0.7.27 und gespeicherte Anbieter-/Modelleinstellungen bleiben erhalten. Es müssen keine zusätzlichen JS-Dateien installiert werden.

## Neu

Nach einem geprüften Ergebnis erscheint **Übernehmen in: Bestehende Partitur (Standard) / Neue Partitur**. Die Auswahl wird gespeichert. Ein Zielwechsel löst keinen neuen KI-Aufruf aus.

Die direkte Übernahme ist zunächst für einfache Vorspiele freigegeben: vollständige 4/4-Takte in C-Dur, auch mehrstimmiges Klavier, Akkorde, Pausen und Punktierungen. Die System-/Stimmzuordnung stammt aus derselben geprüften MusicXML-Fassung wie beim alternativen Ausgabeziel. Die Originalpartitur bleibt geöffnet; ein natives Undo nimmt die komplette Einfügung zurück. Bereits vorhandene Noten und Ausdruckszeichen werden erhalten.

**Grenzen dieser Vorabfassung:** Neue Ausdruckszeichen (auch Pedal und Tempo), Triolen/Tuplets, Vorschläge, Bindungen, andere Ton-/Taktarten, geteilte Klavierparts sowie direkte Fortsetzung/Variation/Ersetzen werden noch nicht unterstützt. Die App bricht solche direkten Übernahmen vor jeder Änderung ab. Anschließend kann ausdrücklich **Neue Partitur** gewählt werden. Es gibt keinen stillen Ersatz und keinen erneuten KI-Aufruf. Die vollständige Zielsetzung aus Issue #2 ist damit noch nicht abgeschlossen.

## Nachweise

- Echte MuseScore-Studio-4.7.6-Linux-GUI mit der tatsächlich ausgelieferten Ein-Datei-App: Übernahme-Schaltfläche, Originalprüfung, automatische Bindung aus validiertem MusicXML, zwei Klaviertakte mit drei Stimmen/22 Ereignissen, Erhaltung aller Originaltakte, ein Undo und sichere Ablehnung neuer Pedalzeichen. [Abschließender Lauf #42356107868](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42356107868).
- Vollständige JavaScript-/Python-/Qt-Regression einschließlich bisheriger Kompositionswege, Windows-Dateipfade im Updater-Test sowie Installation und Neustart: [#42356107961](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42356107961).
- Nativer Rollback nach bereits teilweise geschriebenen Noten/Akkorden/Pausen: [#42352037957](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42352037957).
- Kein kostenpflichtiger KI-Aufruf für diese Prüfungen. Kein vollständiger Windows-MuseScore-End-to-End-Nachweis.
