# AI Notation Studio v0.11.6 — Reparatur der realen Klavier-Ersetzung

**Stand:** 22.10.2026. Aktualisierung über **Update prüfen → Update installieren**.

## Ursache des nachgewiesenen Ausfalls

Der Auftrag „Erstelle eine interessantere Klavierbegleitung“ war im Modus **Instrumentpart ersetzen (mehrstimmig)** korrekt vorbereitet. Die Diagnose vom 22.10.2026 zeigt eine vollständig generierte Klavierbegleitung für **49 Takte** durch Google `gemini-4-argon`. Der frühere Code verweigerte ihre Übernahme wegen unterschiedlicher MusicXML-`divisions` und hätte zusätzlich die fehlende KI-Tonart gegenüber dem g-Moll des Originals verworfen.

## Behoben

- Unterschiedliche MusicXML-Zeitauflösungen werden durch exakte Umrechnung von Noten-, `backup`- und `forward`-Dauern behandelt.
- Für jeden neuen Takt wird die tatsächlich erreichte Dauer kontrolliert; ein nicht vollständig notierter Takt wird zurückgewiesen.
- Der Originalscore bestimmt Taktart und Tonart, selbst wenn der generierte CS1-Header keine Tonart angibt.
- Die erzeugten MusicXML-Attribute dürfen die Original-`divisions` nach der Umrechnung nicht überschreiben.
- **Kostenfreie Wiederholungsprüfung:** Bei einer wegen Validierungsfehler abgelehnten KI-Antwort zeigt die App die Schaltfläche **„Gespeicherte KI-Antwort erneut prüfen (kostenfrei)“**. Sie führt keine neue KI-Anfrage aus. Nach erfolgreicher Prüfung wird die Schaltfläche **„Fertige Fassung in MuseScore öffnen“** verfügbar. Bei erneutem Fehler zeigt die App den genauen Validierungsfehler an.
- Original-Violine bleibt beim vollständigen Ersetzen des Klavierparts in MusicXML erhalten.

## Verifikation

Automatische JavaScript-Tests decken den vierstimmigen Klavierersatz, 49 Takte, geänderte Zeitauflösung und g-Moll-Original bei tonartloser KI-Antwort ab. Ein Qt-Test prüft die kostenfreie Wiederverwendung einer gespeicherten Antwort.

**Erfolgreicher GitHub-Actions-Testlauf:** https://github.com/wibem1/AI-Notation-Studio/actions/runs/39752488220

**Einschränkung:** Noch kein vollständig erfolgreicher Echtlauf der aktualisierten Fassung in MuseScore 4.7.5 mit dem vorhandenen 49-Takte-Score nachgewiesen. Diese Freigabe ist ein diagnosebasiertes Testupdate.
