# AI Notation Studio 0.11.16 – Fortsetzen und Diagnoseexport am Mac

**Datum:** 8. November 2026

## Behebung 1: Fortsetzung mit getrennten Klavierparts

Bei einer Partitur mit Violine, Klavier rechts und Klavier links als **drei getrennten einzeiligen Parts** wurde die Fortsetzung von Version 0.11.15 mit `Anzahl der Notensysteme verändert` abgelehnt. Ursache: Der CompactScore-MusicXML-Konverter exportiert für `piano` auch dann standardmäßig zwei Systeme, wenn das zweite unbenutzt ist. Die strukturelle Zusammenführung kontrollierte die Originalzahl und lehnte korrekt aussehende neue Noten ab.

Version 0.11.16 reduziert für den Modus **Fortsetzen** ausschließlich ein nachweislich unbenutztes zweites Klaviersystem auf die im Original vorhandene einzeilige Struktur. Die vorhandenen Noten und die originale Partitur werden dabei nicht verändert; tatsächliche zweite-System-Noten und unklare Zeitachsen werden abgelehnt. Die bereits gespeicherte KI-Antwort kann über **„Gespeicherte KI-Antwort erneut prüfen (kostenfrei)“** ohne erneuten Provideraufruf verwendet werden.

## Behebung 2: Mac-Diagnose als „Speichern unter“

Der frühere Diagnoseexport konnte nur unter Windows einen frei wählbaren Speicherdialog öffnen; ein provisorisches Ablegen im Plugin-Ordner entsprach ausdrücklich nicht der gewünschten Bedienung.

Auf **macOS** wird nun über `osascript` der native Dialog **„Diagnose speichern unter“** geöffnet. Ordner und JSON-Dateiname werden dort gewählt, ohne später nach der Datei suchen zu müssen. Die App erzeugt die Diagnose zunächst in einer Arbeitskopie und kopiert sie nur nach der Zielauswahl an den gewählten Ort. Anschließend werden Quell- und Zieldatei mit `cmp` verglichen; Bytezahl und SHA-256-Hash werden in der Rückmeldung geprüft. Abbruch und Fehler werden angezeigt. Der Windows-Dialog bleibt unverändert.

## Prüfungen und Grenzen

- `tests/test_append_single_piano_staff.cjs`: synthetische dreiteilige Partitur, Fortsetzung, Notenerhalt, Bassschlüssel, sichere Ablehnung bei realer Zweitsystem-Nutzung – PASS.
- `tests/test_mac_diagnostic_save_dialog.cjs`: macOS-Aufruf, Dialoghelfer, Erfolg, Abbruch und Fehlerrückmeldung in QML-/JavaScript-Testumgebung – PASS. **Der echte macOS-Speicherdialog konnte hier noch nicht auf einem Mac geöffnet werden**; diese abschließende Anwenderprüfung bleibt erforderlich.
- MuseScore Studio 4.7.6 unter Linux: [nativer Integrationstest #42502815232](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42502815232) **SUCCESS** mit synthetischem 28→30-Takt-Fall, drei einzelnen Notensystemen, kostenfreier Antwortverarbeitung, unveränderten Originalnoten und verifiziertem Nicht-Windows-JSON-Dateiexport. Der letzte Notenschlüssel wird mit dem tatsächlich vorhandenen Originalschlüssel verglichen.
- Die finale Versionsnummer 0.11.16 wird vor Veröffentlichung erneut durch denselben nativen Test geprüft. Nutzerpartituren und KI-Zugangsdaten werden nicht nach GitHub hochgeladen.

## Bedienung

**Update prüfen → Update installieren.** Nach dem Update die bereits gespeicherte fehlerhafte Fortsetzung mit **„Gespeicherte KI-Antwort erneut prüfen (kostenfrei)“** erneut prüfen. Zum sicheren Test zunächst **„Neue Partitur“** als Ausgabeziel verwenden. Beim Diagnoseexport auf Mac einen Zielordner und Namen im geöffneten Speicherdialog wählen.

Ältere Releases bleiben unverändert archiviert.
