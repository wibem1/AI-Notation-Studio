# AI Notation Studio 0.11.20 – Notation verbessern (08.11.2026)

## Umfang

Neue Schaltfläche **„Notation verbessern (Analyse starten)“** im Bereich **Notendarstellung**. Der Ablauf erfordert eine echte Bereichsauswahl vollständiger Takte von einem Instrument. Er bereitet zuerst die bereits vorhandene, nach klingenden Noten validierte Strukturkorrektur vor und startet danach die KI-Prüfung enharmonischer Notenschreibweisen. Beide Korrekturarten besitzen getrennte Schaltflächen zur Übernahme; der Analyseknopf selbst ändert keine Noten.

Zusätzlich zeigt die KI Takt-/System-bezogene Befunde zu Rhythmik, Pausen, Verzierungen, Schlüsselwechseln, Stimmen, Akkorden und Vorzeichen an. Diese strukturierten Hinweise sind **nicht automatisch ausführbar**. Die KI darf keine Noten oder klingenden Dauern eigenmächtig löschen oder ändern. KI-Abfragen können Providerkosten verursachen.

## Technische Korrekturen

- MuseScore 4 liefert für Bereichsauswahlen häufig eine leere `selection.elements`-Liste. Notensysteme werden deshalb über `selection.startStaff/endStaff` bestimmt, Noten über die offiziellen Partitur-Cursor erfasst.
- Ungültige Auswahlen werden vor jedem KI-Aufruf abgewiesen.
- Asynchrone KI-Antworten zu inzwischen geänderter Partitur oder Auswahl werden verworfen.
- Strukturierte KI-Befunde werden auf existierende Takte und Notensysteme beschränkt. Eine leere Änderungsliste ist der voreingestellte KI-Korrekturplan.
- Der tatsächliche Auswahlbereich und die Zahl der Takte und Notensysteme werden zur Orientierung mitgegeben; bei unsicherer Taktzuordnung darf die KI keine konkrete Positionsangabe erfinden.

## Nachweise

- [Notation-improvement-Regression #42530186647](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42530186647): **SUCCESS**.
- [Continuation-contract-Regression #42530186659](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42530186659): **SUCCESS**.
- [Nativer MuseScore-4.7.6-Test #42530186643](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42530186643): **SUCCESS**. Bestätigt `ANS_01120_NOTATION_PREFLIGHT PASS` (ungültige Auswahl ohne KI-Aufruf) und `ANS_01120_NOTATION_STRUCTURE PASS` (echte Bereichsauswahl analysiert, ohne KI-Aufruf). Außerdem blieb beim bisherigen Fortsetzungstest der Originalscore unverändert.

## Grenzen und Anwenderprüfung

Die native Prüfung umfasst den Auswahl-/Strukturpfad ohne Provider. **Eine echte KI-Antwort und ihre Übernahme in MuseScore wurden für diese neue Schaltfläche nicht end-to-end geprüft.** Komplexe Rhythmen, ausgeschriebene Verzierungen, Pausen, Schlüsselwechsel und Akkordverteilung werden hier nur im KI-Bericht diskutiert; automatisch ausführbar sind weiterhin nur die vorhandenen, separat bestätigten Struktur-/enharmonischen Korrekturen. Kein allgemeines Versprechen einer vollständig bereinigten Notation.

Nach Installation: vollständige Takte **eines** Instruments markieren → **Notation verbessern (Analyse starten)**. Bericht prüfen; bei vorhandener sicherer Strukturkorrektur **In der Partitur korrigieren**, bei enharmonischen Vorschlägen **Vorgeschlagene Schreibweisen übernehmen** wählen. Vor umfangreichen Änderungen Partitur speichern. Wenn das Resultat musikalisch zweifelhaft ist, rückgängig machen und Diagnose speichern.
