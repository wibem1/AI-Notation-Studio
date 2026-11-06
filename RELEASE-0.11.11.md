# AI Notation Studio 0.11.11 — Vorspiel-Übernahme und Instrumentenbeschriftung

Datum: 06.11.2026

## Ursache der Meldung „Ergebnis erstellt, aber nichts eingesetzt“
Die Diagnose zu v0.11.10 enthält eine gespeicherte KI-Antwort, aber den Status `invalid` und die Fehlermeldung `Rhythmus ist nicht exakt darstellbar`. Bei ansonsten regulären Noten wurden Pedal- und Crescendo-Endpunkte auf Dezimalpositionen (u.a. 2,9 und 4,9) gelegt. Der MusicXML-Konverter verlangte für Ausdruckspositionen dieselbe exakte Tick-Darstellung wie für Noten. Daher brach die gesamte Übernahme ab.

## Änderungen
- Ausdruckspositionen werden **nur für die Platzierung der Spielanweisungen** auf den nächsten darstellbaren Tick gerundet. Tonhöhen und rhythmische Notenwerte werden nicht geändert und bleiben streng überprüft.
- Instrumentennamen im dunklen Vorspielmodus werden in heller Schrift angezeigt.
- Die bereits in der Partitur gespeicherte KI-Antwort kann über **„Gespeicherte KI-Antwort erneut prüfen (kostenfrei)“** erneut verarbeitet werden. Danach **„Fertige Fassung in MuseScore öffnen“** verwenden. Ein neuer KI-Aufruf ist dafür nicht nötig.
- Die Diagnose enthielt Violine **und** Klavier als angekreuzte Zielinstrumente; für künftige reine Klaviervorspiele nur die gewünschten Klavier-Checkboxen auswählen.

## Tests und Grenzen
- [Qt- und Regressionstests](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42291426821) erfolgreich; darunter `tests/test_fractional_markings_0111.cjs` und `tests/test_prelude_ui_0111.py`.
- [Native MuseScore Studio 4.7.6 Import-/Exportprüfung](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42291426814) erfolgreich, inklusive dezimalen Pedalpositionen in einer 34-taktigen Partitur.
- Keine kostenpflichtigen KI-Testaufrufe, keine Benutzerdaten ins öffentliche GitHub hochgeladen.
- Noch nicht durch den Nutzer bestätigt: der erneute Abruf des gespeicherten Entwurfs im echten Windows-Plugin und das Öffnen der neuen Partitur. Die bestehende Partitur bleibt unverändert.
