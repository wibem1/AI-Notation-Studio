# AI Notation Studio 0.11.13 – Vorspiel-Korrektur und Pfeiltasten (07.11.2026)

## Installieren und gespeicherte Antwort übernehmen

1. **Update prüfen → Update installieren**.
2. **Gespeicherte KI-Antwort erneut prüfen (kostenfrei)** anklicken.
3. Für das gemeldete G-Dur-Vorspiel mit Ausdruckszeichen **Neue Partitur** wählen.
4. **Fertige Fassung übernehmen** anklicken. MuseScore öffnet die fertige 34-Takt-Fassung in einem neuen Fenster.

**Nicht erneut komponieren:** Die bereits erzeugte Antwort wird wiederverwendet; die erneute Prüfung sendet keinen neuen KI-Aufruf.

## Behoben

- Zwei ausgewählte Klavierparts mit unterschiedlicher Systemzahl: Wenn das Modell einen vollständig pausierenden Klavierpart und einen kompletten zweihändigen Klavierpart liefert, wird die Musik nur bei eindeutiger Struktur dem vorhandenen zweisystemigen Klavier zugeordnet. Der zusätzliche einzeilige Part pausiert im Vorspiel. Alle erzeugten Noten und Ausdruckszeichen bleiben erhalten; die 32 Originaltakte werden nur in der neuen Fassung nach hinten verschoben.
- Eingehende Stimmnummern passen nun zu den vorhandenen Notensystemen. Das verhindert zusätzliche Pausenstimmen beim MusicXML-Import.
- Fehlgeschlagene Umsetzung zeigt die konkrete Ursache und die Schaltfläche zur kostenfreien Wiederholung zuverlässig an. QML wird nach einem Workflow-Zustandswechsel ausdrücklich benachrichtigt.
- **Up/Down scrollt das Hauptfenster auch nach einem Klick in das schreibgeschützte Ergebnisfeld.** Schreibbare Textfelder, Auswahllisten und Dialoge behalten ihre normale Tastenbedienung.
- MuseScore 4.7.6 kann ein neues Fenster öffnen, aber dem Quellplugin die Ausgangspartitur zurückgeben. Diese wird nicht mehr versehentlich mit den Metadaten des Ergebnisses gestempelt. Die vollständige CS1-Quelle bleibt neben der MusicXML-Datei gespeichert.

## Prüfungen

- Originaldiagnose ausschließlich lokal geprüft: Wiederverwendung der gespeicherten Antwort, 32→34 Takte, alle 96 Original-Parttakte unverändert. Die persönliche Diagnose und Partitur wurden nicht veröffentlicht.
- Synthetischer analoger Drei-Part-Fall mit echter MuseScore-Studio-4.7.6-Linux-GUI: ungültiger Zustand → sichtbare Wiederholung → gültiger Zustand → ausdrückliche Ausgabe als neue Partitur. Die Prüfung läuft auch im neu geöffneten MuseScore-Fenster und exportiert dessen wirkliche 34-Takt-Partitur. Originalmusik unverändert, beide Klavierhände und Pedal/Hairpin/Slur erhalten. [Run #42359032044](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42359032044), Code `e1b59ae`.
- Vollständige JavaScript-/Python-/Qt-Regression einschließlich Fensterfokus/readonly-Up/Down, sichtbarer Fehler-/Wiederholungssteuerung, Anbieter-/Workflowfunktionen und Update/Neustart: [Run #42359032055](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42359032055).

Die Grenzen der direkten Einfügung aus 0.11.12 bleiben bestehen. Insbesondere neue Ausdruckszeichen und G-Dur erfordern weiterhin das ausdrücklich gewählte Ausgabeziel **Neue Partitur**. Dies ist keine Freigabe des vollständigen nativen Einfügeumfangs aus Issue #2. Starter 0.7.27, gespeicherte Keys und ältere Versionsdateien bleiben erhalten.
