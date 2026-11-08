# AI Notation Studio 0.11.15 – Analyse/Komposition sicher unterscheiden (08.11.2026)

## Problem

In Version 0.11.14 war bei einer geöffneten 28-Takt-Sonate in a-Moll der Modus **„Fortsetzen“** ausgewählt. Der eingegebene Text lautete jedoch **„Analysiere die Komposititon“**. Die App richtete sich ausschließlich nach der Modusauswahl und sandte eine kostenpflichtige 16-Takt-Kompositionsanfrage an Google Gemini 4 Argon, statt eine Analyse zu erzeugen. Die Antwort war ein neues Stück in G-Dur, wurde aber wegen eines überfüllten Violintakts 7 (5/4 statt 4/4) abgelehnt. Die Diagnose enthält 12.539 verbrauchte Tokens; ein Geldbetrag ist nicht belegt.

## Korrektur

Bei eindeutig analytischen Befehlen (z. B. „Analysiere“, „Untersuche“, „Beurteile“, „Bewerte“) und gleichzeitig gewähltem Kompositionsmodus stoppt das Plugin **vor** jeder Anfrage. Die Statusmeldung nennt den Widerspruch und fordert dazu auf, **„Auswahl analysieren“** zu wählen. Es wird nicht automatisch umgeschaltet, denn eine verdeckte Modusänderung könnte neue Fehlbedienungen auslösen.

Der Schutz gilt im gemeinsamen Einstieg `sendToAI()` für sämtliche erzeugenden Modi und benötigt keine neuen API-Aufrufe. Bereits gespeicherte KI-Antworten und die Partitur werden nicht verändert.

## Installation

Im Plugin **Update prüfen → Update installieren**. Beim reinen Analysieren den Modus **„Auswahl analysieren“** verwenden, die Takte markieren und den Analyseauftrag starten. Bei einem Modus-/Auftragskonflikt ist **kein** kostenpflichtiger KI-Aufruf mehr möglich.

## Prüfungen

- `tests/test_analysis_intent_guard.cjs`: exakter Diagnosewortlaut einschließlich Schreibfehler, „Bitte analysiere“, „Untersuche“, „Beurteile“, reguläre Fortsetzung als Gegenbeispiel; Aufruf-Sperre vor Providerzugriff.
- Native GUI mit MuseScore Studio 4.7.6 und synthetischer 28-Takt-Partitur: [Testlauf #42498315192](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42498315192) **SUCCESS** für 0.11.15-dev. Kompositionstext wurde direkt im realen Plugin-UI gesetzt, beide falschen Kompositionsmodi wurden ohne Provideranfrage blockiert.
- **Finalversion 0.11.15 erfolgreich in MuseScore geprüft:** [Testlauf #42498488520](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42498488520) **SUCCESS**; reale QML-UI, kein Provideraufruf im Konfliktfall. Der ältere versionsgebundene 0.11.14-Test ist auf seinen früheren Zweig beschränkt.

## Einschränkungen

Die Schutzprüfung deckt eindeutige analytische Formulierungen am Auftragsanfang ab; sie ist **keine vollständige semantische Interpretation beliebiger Freitexte**. Der bereits bezahlte Fehlversuch wird dadurch nicht rückwirkend korrigiert. Eine vorherige KI-Antwort mit einem fehlerhaften Takt darf nicht automatisch „passend gemacht“ werden, wenn die musikalisch korrekte Änderung nicht eindeutig ist.

Ältere Releases bleiben unverändert erhalten.
