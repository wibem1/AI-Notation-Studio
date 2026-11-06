# AI Notation Studio 0.11.9 – Vorspiel voranstellen
Release: 06.11.2026. Starter bleibt unverändert (0.7.27).

## Neu
- Modus **„Vorspiel voranstellen“** im bestehenden Kompositionsbereich.
- Ein oder mehrere Instrumente aus der geöffneten Partitur über **„Instrumente aus Partitur laden“** und die Checkboxen auswählen.
- Anzahl neuer Takte frei wählbar (Voreinstellung 2).
- Die KI bekommt einen kompakten Auszug der ersten sechs Takte jedes vorhandenen Parts und soll das Vorspiel motivisch/harmonisch darauf beziehen.
- Neue MusicXML-Takte werden in einer **neuen Partitur** vor Takt 1 eingesetzt. Alle nicht beteiligten Instrumente erhalten Pausen; die ursprüngliche Partitur wird nicht überschrieben.
- Gesplittetes Klavier in MuseScore-MusicXML: Aufeinanderfolgende gleich benannte Ein-Staff-Piano-Parts mit `<part-name print-object="no">` am zweiten Part werden als eine zweihändige Zielgruppe angezeigt. CS1 mit zwei Systemen wird beim Einfügen auf beide Original-Parts verteilt. Zwei sichtbare, gleichnamige Klaviere bleiben getrennte Instrumente.
- Keine Änderung an anderen Kompositionsmodi oder am Starter. Versionierte 0.11.8-Dateien bleiben erhalten.

## Benutzung
1. Partitur in MuseScore öffnen und AI Notation Studio starten.
2. Ggf. **„Update prüfen“ → „Update installieren“**; die App-Version muss 0.11.9 anzeigen.
3. Modus **„Vorspiel voranstellen“** wählen, **„Instrumente aus Partitur laden“** verwenden und die gewünschten Instrumente aktivieren.
4. Taktzahl eingeben und Kompositionsauftrag formulieren, z. B. „Erstelle ein zweitägiges Klaviervorspiel, das motivisch auf den Beginn vorbereitet.“
5. **„Auftrag ausführen“**. Nach erfolgreicher Generierung **„Fertige Fassung in MuseScore öffnen“** verwenden und die neue Partitur getrennt speichern. Ein Markieren von Takten ist im Vorspielmodus nicht erforderlich.

## Prüfgrundlage
- GitHub Actions allgemeine Regression für den veröffentlichten Stand: **#42266219809 – erfolgreich**.
- GitHub Actions nativer Import mit offizieller MuseScore Studio **4.7.6 Linux AppImage**: **#42265598808 – erfolgreich**. Generierte 34-taktige Partitur wurde als MusicXML importiert, als .mscz gespeichert und wieder als MusicXML exportiert. Ergebnis: vier Parts, jeweils 34 Takte. Test ohne Netzwerk-Provider bzw. kostenpflichtige KI.
- `tests/test_prelude_ui.py`: tatsächliche Qt-Quick-Oberfläche mit MuseScore-/FileIO-Stubs; Auswahl, Checkboxen, Zustände und Moduswechsel.
- `tests/test_prelude_ensemble_32.py`: aus einer bekannten CS1-Partitur erzeugte synthetische Vier-Part-Partitur mit 32 Takten (Flöte, Violine, RH, LH); zwei Takte hinzugefügt, XSD-validierte 34 Takte; voriges Material je Part vollständig und XML-kanonisch unverändert, Violine während Vorspiel stumm.
- `tests/test_prelude_musicxml.py`, `tests/test_prelude_piano_split.cjs`, `tests/test_prelude_prepend.cjs`, `tests/test_prelude_embedded_0119.cjs`: weitere Layout-, MusikXML- und Mapping-Regressionsprüfungen.

## Grenzen
- Eine reale GUI-Bedienung des Plugins **innerhalb MuseScore unter Windows** sowie der tatsächliche KI-Provider-Aufruf sind **nicht** getestet. Der native 4.7.6-Import testet die erzeugte Partitur, nicht den Plugin-Dialog in MuseScore.
- Nicht unterstützte komplizierte Fälle werden bewusst zurückgewiesen, darunter Auftakte/unvollständige erste Takte, unterschiedliche Taktlängen, komplexe mehrstimmige gesplittete Klavierhände. Das ist kein generelles Versprechen für jede Partitur oder jede generierte KI-Antwort.
- MusicXML-Kopien können sich im Seitenlayout vom Original unterscheiden. Die vorhandene Partitur bleibt unverändert.

## Update
Die vorhandene App lädt die neue Feed-Datei `AI-Notation-Studio-App.qml` als versionierte `AI-Notation-Studio-App-0.11.9.qml`. Einstellungen und alte Versionen bleiben erhalten. Der automatische Rückfall auf zuvor gespeicherte Fassungen ist Gegenstand der vorhandenen Update-/Neustarttests.
