# AI Notation Studio v0.11.3 — In-App-Update (Testfreigabe)

Stand: 22.10.2026. Der Quellcode ist auf `main` freigegeben und über den integrierten GitHub-Updater abrufbar.

## Installation

In MuseScore das bereits installierte AI Notation Studio öffnen. `Update prüfen` und danach `Update installieren` wählen. Das Plugin lädt `AI-Notation-Studio-App.qml` direkt vom Repository `main`, schreibt die neue Datei lokal als `AI-Notation-Studio-App-0.11.3.qml` und lädt die neue Oberfläche. Wenn MuseScore den Austausch nicht sofort anzeigt, MuseScore neu starten.

## Änderungen

- Neue Funktionen `Stimme ersetzen (auch Klavier)` und `Instrumentpart ersetzen (mehrstimmig)`; vollständiger Ersatz einer gewählten mehrstimmigen Klavierbegleitung ohne Veränderung der Violinstimme.
- Eigenständige Funktion `Neue Stimme zu Auswahl` bleibt ein nicht ersetzender Zusatzmodus.
- Der in `compactscore-context.js` entwickelte MusicXML-Code ist nun tatsächlich in `AI-Notation-Studio-App.qml` eingebettet. Frühere unvollständige Auslieferung repariert.
- 49-Takte-Prüfungen, Integritätsprüfungen zu Taktgrenzen, zeitlicher Auflösung und unverändertem Original.
- Automatisierte GitHub-Actions-Regression inklusive Test des ausgelieferten QML-Runtimes.

## Bestätigte Tests

GitHub-Actions-Lauf: https://github.com/wibem1/AI-Notation-Studio/actions/runs/39685219570 (SUCCESS). Die Tests verwenden simulierte MuseScore-APIs und headless Qt. Die neue Version ist keine durch echten MuseScore-Nativtest bestätigte stabile Fassung.

## Bekannte Einschränkungen

Der Echtbetrieb in MuseScore 4.7.5 und ein echter OpenRouter-End-to-End-Aufruf sind nicht nachgewiesen. Eine zuvor bestehende Legacy-Updater-Prüfung ist in Linux-CI ausgenommen. Für komplexe MusicXML-Konstellationen können Schutzabbrüche auftreten. Ausgangspartitur vor Anwendung speichern, das Ergebnis zunächst als neue Partitur prüfen.

## Update-Datei

Öffentliche Quellversion: `AI-Notation-Studio-App.qml` (main). Unveränderliche Versionskopie im Repository: `versions/AI-Notation-Studio-App-0.11.3.qml`.
