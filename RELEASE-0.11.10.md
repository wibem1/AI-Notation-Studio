# AI Notation Studio 0.11.10 – Vorspiel-Reparatur (06.11.2026)

## Warum 0.11.9 bei der Nutzerpartitur kein Vorspiel erzeugte
Eine echte Diagnose aus MuseScore Studio 4.7.6 dokumentiert die zwei aufeinanderfolgenden bestehenden Klavier-Instrumentparts P3 `Klavier` und P4 `Klavier, Klavier LH`. **Beide besitzen jeweils zwei Notensysteme**; sie sind daher nicht einfach RH/LH-Einzelstaff-Parts. Die KI erzeugte zwei neue CS1-Klavierparts mit insgesamt zwei Takten. Der zweite generierte Part hatte in Takt 2 **4,5 Viertel** statt 4/4. Darum setzte die 0.11.9-Prüfung nichts ein. Der Source-Score blieb unverändert.

## Korrektur
- Robustere MusicXML-Zuordnung: Für echte Ein-Staff-Continuation bleibt die bereits vorhandene RH/LH-Gruppierung verfügbar, einschließlich expliziter LH-Bezeichnung, aber die zweisystemigen P3/P4 aus der Diagnose bleiben **getrennte auswählbare Instrumentparts**.
- KI-Antworten können weiterhin mit zwei solchen Zielparts verarbeitet werden. Wenn ein Anbieter dagegen für ein echtes gesplittetes Ein-Staff-Klavier zwei Kompositionsparts erzeugt, bleibt die separate geschützte Aufteilung erhalten.
- **Gezielte rhythmische Rekonstruktion bei der Auftragsvalidierung:** Bei einem um genau ein Achtel überfüllten Takt mit **drei abschließenden Achtelnoten** nach exakt drei Viertelzeiten kann die App diese drei Achtel als **3:2-Triole** notieren. Alle Tonhöhen/Anschläge bleiben erhalten; der Schritt wird sichtbar gemeldet, nicht allgemein quantisiert und bei anderen Abweichungen nicht ausgelöst.
- Der MusicXML-Kern enthält zusätzlich einen eng begrenzten, in Tests abgesicherten Vorschlagsnoten-Fallback für ein einzelnes überzähliges Schlussachtel. Alle anderen unplausiblen Notationen werden abgewiesen, ohne die Originalpartitur zu verändern.
- **Gespeicherte fehlerhafte KI-Antwort erneut prüfen:** Bereits vorhandene `raw_response` kann mit dem vorhandenen Button `Gespeicherte KI-Antwort erneut prüfen (kostenfrei)` nochmals gegen die korrigierte Engine geprüft werden. **Kein erneuter Anbieter-API-Aufruf**. Danach `Fertige Fassung in MuseScore öffnen`.

## Prüfungen
- [GitHub Actions – vollständige veröffentlichte Regression](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42287786062): erfolgreich.
- [Native MuseScore 4.7.6 Import-/Exportprüfung (analoger vierstimmiger 32→34-Takte-Fall)](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42287184798): erfolgreich.
- `tests/test_prelude_0110_recovery.cjs`: reale Fehlerstruktur in anonymisiertem synthetischem Fall reproduziert; Drei-Achtel-Triole, überzählige Einzelachtel-Vorschlagvariante, 34-Takte-Integration und alle vier Parts geprüft.
- Keine kostenpflichtigen KI-Testaufrufe. Die vom Nutzer übermittelte Diagnose bzw. Originalpartitur wurde **nicht** ins öffentliche Repository übernommen.

## Bekannte Grenzen
Die GitHub-Nativprüfung verwendet die offizielle MuseScore-Linux-AppImage; der konkrete Windows-Plugin-Ablauf nach der Aktualisierung ist noch nicht vom Nutzer bestätigt. Der spezielle Triole-Fix ist ein **musikalischer Interpretationsentscheid**, keine vom KI-Modell explizit vorgegebene Triole. Nicht jedes übervolle oder komplexe KI-Metrum kann verlustfrei rekonstruiert werden.

## Aktualisierung
Bestehende App `Update prüfen → Update installieren` auf Version **0.11.10**, Starter und alle älteren versionierten QML-Dateien bleiben erhalten.
