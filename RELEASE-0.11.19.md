# AI Notation Studio 0.11.19 – Fortsetzung mit Übergang und getrennten Klavierhänden

**Datum:** 08.11.2026

## Ursache
Die reale Anwenderdiagnose `AI-Notation-Studio-Diagnose-1794162946487-963319.json` aus Version 0.11.18 zeigt den Fehler `Error: Anzahl der Notensysteme verändert.` bei einer 19-Takt-KI-Antwort (3 Übergangstakte, 16 neue), Besetzung Violine / Klavier rechts / Klavier links als drei getrennte einzeilige Parts. Anders als der bisher getestete `append`-Fall verwendet der Auftrag `workflowKind=replaceTail`: Takte 26–28 werden ersetzt und 16 weitere Takte angefügt.

Die bereits vorhandene Sicherheitskorrektur `alignContinuationPianoStaves` war nur für `append` aktiviert. Beim `replaceTail` erzeugte der CS1-Konverter wieder ein technisch unbenutztes zweites Klaviersystem und der XML-Workflow lehnte die Übernahme zu Recht ab.

## Korrektur
Die gleiche **konservative** Anpassung wird jetzt auch bei `replaceTail` angewendet: Nur ein nachweislich unbenutztes zweites Klaviersystem im erzeugten Klavierpart darf entfernt werden. Tatsächlich dort notierte Noten, Mehrstimmigkeit mit anderer Zeitachse und unklare Fälle werden abgelehnt. Die Originalpartitur sowie Tonhöhen und Dauern der KI-Antwort bleiben unverändert.

## Prüfung
- `tests/test_append_single_piano_staff.cjs` um gezielte `replaceTail`-Prüfung erweitert: Übergangstakt ersetzen, weiteren Takt ergänzen, drei getrennte Parts, Bassschlüssel erhalten, tatsächliches zweites System weiterhin blockiert.
- [Regression #42511206616](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42511206616): **SUCCESS**.
- [Nativer MuseScore-Test #42511206613](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42511206613): **SUCCESS**, synthetischer `replaceTail`-Fall direkt im Plugin und anschließender bestehender Integrationsweg. Die finale 0.11.19 wird nochmals getestet.
- Es gab keinen KI-Provideraufruf. Die vollständige echte Gemini-Antwort wurde nicht nach GitHub übertragen; mit echten Benutzerdaten ist der MuseScore-Übernahmeweg daher noch nicht abschließend bestätigt.

## Nutzung
Im Plugin **Update prüfen → Update installieren → Gespeicherte KI-Antwort erneut prüfen (kostenfrei)**. Danach zunächst Ausgabeziel **Neue Partitur** wählen. Es handelt sich um dieselbe bereits bezahlte Gemini-Antwort; ein erneuter Modellaufruf ist nicht erforderlich.
