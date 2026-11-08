# AI Notation Studio 0.11.14 – Überarbeitung, Klavier-IDs und Score-Gedächtnis (08.11.2026)

## Installation

Im bestehenden AI-Notation-Studio-Starter: **Update prüfen → Update installieren**. Die bestehende Plugin-Installation und API-Keys bleiben erhalten. Danach bei der betroffenen Sonate mit offenem Originalscore **Gespeicherte KI-Antwort erneut prüfen (kostenfrei)** wählen.

**Für die 28-taktige Überarbeitung ausdrücklich „Neue Partitur“ auswählen**, dann **Fertige Fassung übernehmen**. Die direkte native Einfügung für diesen Replace-Workflow ist weiterhin nicht freigegeben. Das Ergebnis öffnet sich als eigene MuseScore-Partitur, das Original bleibt unangetastet.

## Behoben

- Die von Gemini 4 Argon erzeugte Antwort mit zwei unterschiedlichen Klavierparts und identischer technischer `piano`-ID wird in einer eindeutig erkennbaren 3-Part-Zielbesetzung lokal und ohne erneuten Modellaufruf auf getrennte IDs korrigiert. Noten bleiben dabei erhalten.
- **Konkrete Rhythmusabweichung des gespeicherten Nutzerfalls:** in der **neu erzeugten** linken Klavierhand ist der letzte Ton A1 in Takt 12 eine halbe statt einer Viertelnote, sodass der Takt 5/4 statt 4/4 enthält. Nur bei exakter Übereinstimmung der Konstellation wird die Note verkürzt. Der sichtbare Hinweis nennt diese musikalische Änderung. Das Original wird nicht geändert. Andere fehlerhafte Takte werden mit präziser Meldung abgelehnt.
- Rekursive Einbettung des gesamten Score-Gedächtnisses in exportierte MusicXML-Arbeitskopien, Diagnosen und gespeicherte Workflow-Snapshots verhindert. Bereits alte Partitur-Metadaten bleiben erhalten, sofern der Nutzer sie nicht selbst entfernt.
- Unbekannte Preise/Providerkosten werden nicht länger als bloße Null-Dollar-Gesamtsumme ausgewiesen.

## Prüfgrundlagen

- **Originaldiagnose lokal**, nicht in GitHub veröffentlicht: Gemini-CS1 mit 3 × 28 Takten; nach lokaler ID- und Takt-12-Korrektur 0 CompactScore-Rhythmusfehler; Zusammenführung mit der tatsächlichen bereinigten ursprünglichen MusicXML erfolgreich, 28 Takte / 3 Parts.
- **Automatisierter V8-Test:** synthetischer 28-Takt-Workflow, korrekte IDs, Erhalt der Original-MusikXML und unabhängiger Score-Metadaten, Schutz vor nicht zulässiger Notenänderung.
- **Echter MuseScore-Studio-4.7.6-Linux-GUI-Test:** [Run #42492853438](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42492853438) auf der Staging-Fassung: synthetischer 3-Part-Fall 28 Takte, tatsächlicher Plugin-Aufruf, Offline-KI-Antwort, gezielte Reparatur, separate neue Partitur und unverändertes Original. Die neue Score-Datei wurde im **neuen** MuseScore-Fenster geprüft.
- **Finalversion 0.11.14 erfolgreich:** [Run #42493365875](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42493365875), vollständiger offizieller MuseScore-4.7.6-Test mit sichtbar fehlgeschlagener Antwort → kostenfreiem Klick auf den Retrybutton → gültigem Ergebnis → separatem importierten 28-Takt-/3-Systeme-Fenster; 28-Takt-Original musikalisch unverändert, keine KI-Anfrage. GitHub Actions: **SUCCESS**.

## Grenzen

Der Test der Benutzerpartitur ist eine programmgesteuerte interne Rekonstruktion; das reale MuseScore-GUI-Szenario verwendet absichtlich einen **synthetischen** 28-Takt-Fall. Ein optischer, künstlerischer Vergleich der Originalkomposition mit dem überarbeiteten Ergebnis durch den Nutzer steht aus. Eine direkte, vollständig rückgängig machbare Übernahme beliebiger Überarbeitungen in bestehende Partituren ist nicht enthalten. Für den genannten Auftrag wird eine **neue Partitur** verwendet, daher wird kein Eingriff in die ursprüngliche Undo-Historie vorgenommen.

Die bisherigen Versionen, insbesondere 0.11.13, bleiben unverändert archiviert.
