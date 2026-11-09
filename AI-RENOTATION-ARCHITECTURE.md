# KI-Neunotation mit MusicXML – Entwurf für 0.11.22

## Verbindliche Architekturentscheidung

Die bisherige KI-Analyse, die lediglich Textbefunde und einzelne TPC-Vorzeichenänderungen ausgab, wird für den Hauptknopf **„Notation verbessern“** durch einen vollständigen *MusicXML-Neunotationsauftrag* ersetzt.

Der Benutzer markiert 1–12 **vollständige Takte** eines Instruments, mit sämtlichen Notensystemen dieses Instruments. Das Plugin exportiert seine Originalpartitur in MusicXML, übergibt der KI ausschließlich die ausgewählten Takte mit je einem benachbarten Takt als Kontext und verlangt für jeden ausgewählten Index ein vollständiges neues `<measure>`-Element. Ein weiterer KI-Aufruf erfolgt nur auf ausdrücklichen Klick (API-Kosten).

## Validierung und Übernahme

1. Die KI antwortet in JSON mit `report` und `measures:[{index,xml}]`. Index ist nullbasiert innerhalb des Instrument-Parts; das originale Takt-`number` bleibt erhalten.
2. Das Plugin prüft die Zahl und Identität aller Takte sowie die MusicXML-Struktur. Die KI darf keine Takte auslassen, hinzufügen oder außerhalb der Auswahl ändern.
3. Aus den gültigen Takten wird eine **Kopie** des vollständigen Original-MusicXML zusammengesetzt. Andere Instrumente, andere Takte und die Partiturmetadaten stammen ausschließlich vom Original, nicht von der KI.
4. Der Validator verlangt identische klingende Tonhöhen, Einsatzzeiten und Dauern. Bereits vorhandene Ausdrücke wie Dynamikanweisungen, Artikulationen, Text unter Noten und Tempomarkierungen dürfen nicht verschwinden. Auch Tonart, Taktart und Transposition werden nicht stillschweigend verändert.
5. Bei jeder Abweichung wird das Ergebnis verworfen. Keine automatische Wiederholung mit Providerkosten. Erst der zweite Knopf **„KI-Korrektur als Partiturkopie öffnen“** öffnet die geprüfte MusicXML-Fassung separat in MuseScore. Das Original wird nicht überschrieben.

## Grenzen und noch offene Tests

- Der Validator prüft musikalische Ereignisse und geschützte Ausdruckselemente, kann die *ästhetische Lesbarkeit* oder alle semantischen Fälle wie aufwendig umnotierte Vorschlagsnoten nicht allein beweisen. Die neue Partitur muss im Notenbild beurteilt werden.
- Die Durchlaufbegrenzung von 12 Takten und 36.000 Zeichen KI-Kontext begrenzt Kosten und API-Ausgabe. Größere Abschnitte müssen einzeln bearbeitet werden.
- Das GitHub-Regressionstestmodul `tests/test_ai_rewrite.cjs` simuliert eine echte Korrektur und absichtlich ungültige KI-Antworten, ohne Providerkosten. Ein nativer MuseScore-Test kontrolliert MusicXML-Auswahl, Roundtrip und Ablehnung eines unzulässigen Index.
- **Noch kein echter Provider-Aufruf, kein End-to-End-Test der vom Modell tatsächlich erzeugten neuen Partitur und kein interaktiver Praxistest des Öffnungsbuttons.**
- **Keine Freigabe von 0.11.22-dev**, bis diese offenen Punkte überprüft und dokumentiert sind.

Entwicklungsbranch: `feat/ai-musicxml-rewrite-20261109`, Pull-Request #15 (Entwurf).
