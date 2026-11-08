# AI Notation Studio 0.11.21 – Ausführbare Notationskorrekturen

## Was jetzt tatsächlich korrigiert wird

Der Notationsbereich bietet **„Sichere Notationskorrekturen prüfen“** und **„Korrigierte Notation öffnen (Kopie)“**.

Die Korrekturengine kann zwei klar definierte Fehler selbstständig bearbeiten:

1. **Überflüssige Schlüsselwechsel**: Nur unverändert wiederholte, einfache G-/F-/C-Schlüssel in vollständig ausgewählten Takten werden entfernt. Echte Schlüsselwechsel, Schlüssel mit Sonderformatierung und systembedingt erneut gedruckte Schlüssel bleiben stehen.
2. **Fehlende Achtelbalken**: Eindeutige Zweiergruppen in 2/4, 3/4 und 4/4 beziehungsweise Dreiergruppen in 6/8, 9/8 und 12/8 werden mit Balken notiert. Nur vollständig regelmäßige Gruppen in einer einzigen Stimme und ohne bestehende Balken, Verzierungen, Triolen, Sondernotation oder absichtlich fehlende Notenhälse werden bearbeitet.

Eine vollautomatische Änderung erfolgt **nicht** beim Analyse-Klick. Zunächst werden die exakten Korrekturen protokolliert. Danach öffnet der Nutzer ausdrücklich eine **korrigierte MusicXML-Partiturkopie**. Das Original bleibt unverändert. Vor dem Öffnen wird die ursprüngliche Partitur erneut verglichen; die klingenden Tonereignisse müssen zwischen Original und Korrektur identisch sein.

Die bisher vorhandenen Stimmenstruktur- und enharmonischen Korrekturen bleiben unabhängig davon erreichbar. Die neue Korrektur erfordert keinen KI-Aufruf und keine Providerkosten.

## Was noch nicht automatisch korrigiert wird

Komplexe Rhythmusumschreibungen, überflüssige Stimmenpausen, Verzierungen, musikalisch sinnvolle Neuverteilung von Akkorden, problematische Stimmeinsätze und grafische Kollisionen werden weiterhin höchstens analysiert beziehungsweise gemeldet. Insbesondere dürfen Notenanschläge, Tonhöhen, tatsächlich klingende Dauern oder Phrasierungen nicht aufgrund eines bloßen KI-Vorschlags verändert werden.

## Nachweise

- Offline-Regression `tests/test_redundant_clef_repair.cjs`: isolierter Aufruf des produktiven QML-MusicXML-Reparaturmoduls mit synthetischen Partituren. Prüft echte und unechte Schlüsselwiederholungen, 4/4- und 6/8-Achtelgruppen, Klangsignatur, Änderungsgrenzen, Idempotenz, Sondernotation und systembedingte Schlüssel.
- Nativer MuseScore-Test `tests/native_append_01116_probe.qml`: fügt einen redundanten G-Schlüssel in die Testpartitur ein und testet die Entfernung; prüft außerdem die Wiederherstellung von vier Achtelgruppen in einem synthetischen 4/4-Beispiel. Beide Reparaturen prüfen unveränderte klingende Tonereignisse.
- Noch offen bis CI-Auswertung: abschließende native MuseScore-Prüfung der finalen Branchfassung und Anwenderprüfung der Bedienoberfläche. Insbesondere das Öffnen der korrigierten Kopie nach dem Klick wurde nicht in einem interaktiven Benutzertest bestätigt.

## Bedienung

Vollständige Takte eines Instruments markieren → **Sichere Notationskorrekturen prüfen** → Bericht lesen → **Korrigierte Notation öffnen (Kopie)**. Bei null sicheren Änderungen bleibt die Übernahme deaktiviert. Das Original wird nicht überschrieben.
