# Entwicklung

## Eine aktive Linie

Ab v0.7.0 wird die Entwicklung bewusst vereinfacht:

- `main` ist die einzige aktive Entwicklungslinie.
- Jede Änderung bekommt einen eigenen Git-Commit.
- Jede veröffentlichte Version erhält eine eindeutige Versionsnummer.
- Rollback erfolgt über Git-Historie, nicht über parallele Zweige.

## Verbindlicher Ablauf

1. API prüfen.
2. Änderung implementieren.
3. statisch kontrollieren.
4. Dokumentation aktualisieren.
5. über die eingebaute Updatefunktion ausliefern.
6. praktisch in MuseScore testen.
7. bei Fehlern auf den letzten funktionierenden Commit zurückgehen.

## Musikalisches Prinzip

Ab 0.10.0 gilt für alle Kompositionsmodi dieselbe CS1-Umsetzung. Die explizite Auswahl bestimmt den Ablauf: direkt, Idee → Komposition, vollständige Musik → Formatübertragung. Nur der Ideenmodus hält für die Bearbeitung an. Ein Auftrag erfasst Kontext, musikalische Angaben und beide Modellkonfigurationen vor dem ersten Netzwerkaufruf. Keys bleiben in Settings und werden nicht im Auftrag, im Score-Gedächtnis oder im Protokoll gespeichert.

## Loader-Architektur ab v0.7.10

v0.7.10 ist die Brücke vom monolithischen Plugin zur getrennten Loader/App-Struktur. Der klassische Einstieg `AI-Notation-Studio.qml` bleibt der MuseScore-Plugin-Host. Er enthält einen Loader, der künftig versionierte App-Dateien mit jeweils neuer URL lädt. Dadurch soll der bekannte QML-Komponenten-Cache umgangen werden, ohne MuseScore nach jedem Update neu zu starten.

Der Update-Feed prüft zuerst `AI-Notation-Studio-App.qml`. Ist diese Datei noch nicht veröffentlicht oder ungültig, wird auf `AI-Notation-Studio.qml` zurückgefallen. Eine Live-App wird lokal unter `AI-Notation-Studio-App-<Version>.qml` gespeichert, nachgelesen, anhand der Versionsnummer geprüft und erst danach aktiviert.

## v0.8.0 – erste Live-App

Die Datei `AI-Notation-Studio-App.qml` ist ab v0.8.0 der Update-Feed für die eigentliche Anwendung. Der Host lädt nach erfolgreichem Download lokal eine Datei mit versionsspezifischem Namen, z. B. `AI-Notation-Studio-App-0.8.0.qml`. Die unterschiedliche URL ist bewusst Teil des Designs, damit die neue QML-Komponente nicht unter derselben gecachten URL wie die vorherige Version läuft.

Die App bleibt selbst ein `MuseScore`-API-Objekt, wird aber vom Host als QQuickItem über `Loader` eingebettet. Weil ein geladenes Unterobjekt nicht über MuseScores normalen Plugin-Startpfad gestartet wird, stellt es `bootstrapRun()` bereit; der Host ruft diese Funktion in `Loader.onLoaded` auf.

## CompactScore-Laufzeit ab 0.9.0

Die Quellmodule `compactscore.js`, `compactscore-musicxml.js`, `compactscore-costs.js` und `compactscore-context.js` sind in die QML eingebettet. Nach Änderungen mit `NODE_PATH=<Babel-installation>/node_modules node scripts/embed-compactscore.cjs` neu erzeugen; benötigt @babel/core und @babel/preset-env (getestet mit 8.0.6). Dies ist ausschließlich ein Entwicklungsschritt. Danach die App identisch nach `versions/AI-Notation-Studio-App-0.10.0.qml` kopieren.

`python tests/test_compactscore.py` benötigt PySide6 und lxml und prüft den tatsächlich eingebetteten Code mit QJSEngine, die zwei realen CS1-Beispiele gegen MusicXML 4.0 sowie die API-Anfragen und Kosten. MuseScore bleibt der notwendige praktische Endtest.

## Tests 0.10.0

`python tests/test_workflows.py` prüft alle 18 Kombinationen aus sechs Modi und drei Arbeitsweisen mit deterministischen Provider-Antworten. Zusätzlich werden zusammengeführte MusicXML-Partituren gegen XSD validiert, Originalnoten verglichen, Auswahlpausen, Auftakte und transponierende Instrumente geprüft. `python tests/test_ui.py` startet die echte QML-Oberfläche offscreen mit den in `tests/qml-stubs` enthaltenen API-Testobjekten und prüft das editierbare Ideenfeld. Keine Tests verwenden echte API-Keys oder erzeugen kostenpflichtige Anfragen. Die Testobjekte ersetzen keinen realen MuseScore-Praxistest.

## Startdiagnose ab 0.10.2

Der Starter 0.7.12 enthält nur die MuseScore-API, FileIO, QtQuick und einen Loader. Er zeigt QML-Kompilierfehler über Qt.createComponent().errorString() sowie Bootstrapfehler als auswählbaren Text. Keine Controls- oder Labs-Abhängigkeit im Starter. Explizite implicitWidth/implicitHeight unterstützen MuseScores ExtensionViewer. Die eigentliche App bleibt selbstständig und behält ihre Updatefunktion.

MuseScore registriert Settings in MuseScore 3.0 (src/framework/extensions/api/v1/extapiv1.cpp). Beide Dateien verwenden MS.Settings. Der alte Teststub exportierte nur MuseScore und erzeugte dadurch eine falsche Diagnose. Er exportiert jetzt auch Settings; das ursprüngliche Host-QML lässt sich damit ohne zusätzlichen Import kompilieren. Windows-Pfade und Loader-Fehlerrückkehr bleiben geprüft. Die frühere Startkorrektur gilt nicht als bewiesene Ursache des Windows-Problems.

## 19.10.2026 · Update 0.11.1 / Starter 0.7.27

Das Update bleibt auf der bestehenden main-Linie. Der Starter ist als generierter Quelltext in der App enthalten; nach Starteränderungen `python scripts/embed-starter.py` ausführen und die aktuelle versionierte App neu kopieren. Die App sichert den älteren Starter, verifiziert den Ersatz und überschreibt keinen neueren Starter. Bei Qt-Dateicachefehlern wird der verifizierte gespeicherte Quelltext via Qt.createQmlObject kompiliert; Import-, Versions- und Bootstrapfehler bleiben blockierend. Der reguläre Datei-Loader bleibt der Normalfall. Tests enthalten den realen bisherigen Starter 0.7.25 und die App 0.10.33 als unveränderte Fixtures.


## 2026-10-21 — MuseScore: zusätzliche Klavierstimme

- Fehlerbild: 49-Takt-Partitur, neue Begleitung hatte nur einen klingenden Takt; der Takt lag vor dem eigentlichen musikalischen Einsatz; zusätzliches Klavierinstrument wurde erzeugt.
- Schutzprüfungen: Erkennung einer nahezu leeren Antwort und eines vorgezogenen Einsatzes bei anfänglichem Pausentakt.
- `compactscore-context.js`: Neuer Modus `overlay` ergänzt Stimmen im bereits vorhandenen zweisystemigen Klavierpart an der Originalposition und behält Violine sowie Originalklavier bei. Abweichende Taktgrenzen, Taktlängen, Auflösung, Systemzahl, Zielstimmen oder mehrdeutige Instrumente führen zum Abbruch.
- `AI-Notation-Studio-App.qml`: Zielinstrument-Erkennung und Weitergabe der exakten Auswahlgrenzen an den Overlay-Modus.
- Test: Synthetische zweistimmige MusicXML-Probe mit vorhandener Violine/Klavier im Laufzeit-JavaScript bestanden; unveränderte Part-Anzahl, zusätzliche Stimmen 3/4, versetzter Auswahlbeginn zurückgewiesen. Regressionstest unter `tests/test_piano_voice_overlay.cjs` eingecheckt.
- OFFEN: Echte MuseScore-Integration und vollständiger 49-Takt-Test wurden nicht ausgeführt. Keine neue Veröffentlichung bis zu diesen Tests. Komplexe XML-Verläufe sind bewusst noch gesperrt.

## 2026-10-21 — Verbindliche Semantik der Partiturbearbeitung

Die Bedienoptionen sind strikt zu trennen:

1. **Stimme hinzufügen (bestehende Option):** Neue unabhängige Stimme im bestehenden Instrument und im ausgewählten Zeitfenster, alle bisherigen Noten und Stimmen bleiben erhalten. Keine stillschweigende Ersetzung. Erfordert freie Zielstimme und musikalische Abstimmung.
2. **Stimme ersetzen (NEUE Option, noch zu implementieren):** Nur die ausdrücklich ausgewählte vorhandene Stimme im ausgewählten Zeitfenster austauschen. Andere Stimmen, Instrumente und Takte müssen unverändert bleiben; vor Veränderung Auswahl und Umfang prüfen und Rücknahme sicherstellen.
3. **Instrument hinzufügen:** Ein vollständiger neuer Instrumentpart wird neben vorhandenen Instrumenten angelegt. Nicht mit Stimme hinzufügen gleichsetzen.

Ein freier Sprachauftrag (z. B. 'interessantere Klavierbegleitung') darf keine destruktive Ersetzung ohne explizit ausgewählten Bearbeitungsmodus auslösen. Für Ersetzen einen eigenen UI-Modus, gezielte Spur-/Stimmenauswahl und getrennte Integrationstests einführen. Der zuletzt eingeführte Overlay-Code gehört ausschließlich zu **Stimme hinzufügen** und ist keine Implementierung von **Stimme ersetzen**.

**Freigabesperre:** Kein Release, bevor diese Semantik und die Integrität unbeteiligter Stimmen in MuseScore geprüft wurden.

### 2026-10-21 — Implementierungsstufe „Stimme ersetzen“

- Neuer separat ansprechbarer MusicXML-Kontextmodus `replaceVoice` für die gezielte Ersetzung genau einer Stimme in einem explizit gewählten einstimmigen Instrumentpart, innerhalb vollständiger Takte.
- Die Originalpartitur wird nicht überschrieben; nicht ausgewählte Parts und Takte bleiben in der erzeugten Kopie unangetastet.
- Ersetzung wird bei mehrsystemigen Instrumenten (insbesondere Klavier), mehrstimmigen Zieltakten, ungenauen Grenzen und inkompatiblen Notendauern abgebrochen, damit keine ungewollte Ersetzung erfolgt.
- Synthetischer JavaScript-Funktionstest einschließlich Negativfällen erfolgreich; Regressionstest: `tests/test_replace_voice.cjs`.
- **Offen:** Auswahl der konkreten Stimme im MuseScore-UI, vollwertige Klavierstimmen-Ersetzung unter Wahrung anderer Stimmen, Ausdruckszeichen-Behandlung und nativer MuseScore-Test. `replaceVoice` ist bislang eine Engine-Funktion und keine freigegebene Benutzeroption. Keine Veröffentlichung.

### 2026-10-21 — UI-Anbindung von „Stimme ersetzen“

- Neuer Modus 7 in der Kompositionsmodus-Auswahl: `Stimme ersetzen (einstimmig)`.
- Die Auswahl muss genau ein Notensystem enthalten; der Zielpart wird aus den MuseScore-Tracks ermittelt und an die `replaceVoice`-Engine übergeben.
- Mehrsystemige Parts (Klavier) werden bis zur separaten Stimmen-/System-Zuordnung bewusst abgelehnt.
- Statischer UI-Regressionstest `tests/test_replace_voice_ui.cjs` ergänzt; noch kein MuseScore-Integrationstest ausgeführt.
- Nicht freigegeben: Test in nativer MuseScore-Umgebung, Ausdruckszeichen/komplexe Stimmen, echte Klavierbegleitungs-Ersetzung.

### 2026-10-21 — Klavier-Ersetzung, eingeschränkt implementiert

- `replacePianoStaff` ersetzt ausschließlich die gewählte Klavierhand (System 1 oder 2) innerhalb vollständiger Takte in einer neuen MusicXML-Partitur. Die jeweils andere Hand bleibt erhalten.
- Der UI-Modus `Stimme ersetzen (auch Klavier)` liest das gewählte System aus MuseScore und übergibt `partIndex` sowie `staffNumber` an die Engine.
- Vorsätzliche Schutzgrenzen: Nur zweisystemige Klavierparts mit jeweils einer Stimme pro System und gleicher MusicXML-Division; Takte mit weiteren Stimmen, Ausdruckszeichen, Harmonieobjekten oder komplexen Strukturen werden zurückgewiesen. Ersetzung einzelner Stimmen innerhalb eines mehrfach belegten Systems bleibt offen.
- JavaScript-Probe für Austausch von rechter und linker Hand und Negativfälle bestanden. `tests/test_replace_piano_staff.cjs` im Repository.
- Echte MuseScore-Ausführung und musikalische Integration mit KI sind weiterhin ungetestet: keine neue Version freigeben.

### 2026-10-21 — Weitere Sicherheitstests zur Klavier-Ersetzung

- `replacePianoStaff` lehnt nun Haltebögen, Vorschlagsnoten, Tuplets und andere nicht zuverlässig erhaltbare XML-Angaben explizit ab; insbesondere werden Metadaten der neu erzeugten Stimme nicht stillschweigend entfernt.
- Testreihe auf 49 Takte erweitert: Austausch im oberen System, Erhaltung aller 49 unteren Takte, keine Übernahme der nicht angeforderten unteren neuen Stimme.
- JavaScript-Regressionstest `tests/test_replace_piano_staff.cjs` erfolgreich ausgeführt, einschließlich negativem Haltebogenfall.
- Noch KEIN nativer MuseScore-Test und KEIN vollständiger KI-Praxistest. Die Klavier-Funktion bleibt ausdrücklich auf einfache einlagige Systeme begrenzt und ist nicht zur Release-Freigabe geeignet.

### 2026-10-21 — Mehrstimmige Klavierbegleitung komplett ersetzen

- Neuer Modus 8 in der Auswahl: `Instrumentpart ersetzen (mehrstimmig)`. Er unterscheidet sich bewusst vom Hinzufügen einer Stimme und vom Ersetzen einer einzelnen Stimme.
- Die Auswahl darf beide Systeme desselben Klavierparts umfassen. Andere Instrumente in der Auswahl werden abgefangen.
- Die Engine-Funktion `replaceInstrumentPart` ersetzt alle ausgewählten Takte des Zielparts als vollständiges MusicXML, einschließlich Akkorden und mehreren Stimmen in beiden Klaviersystemen. Nicht ausgewählte Instrumente und Takte bleiben unberührt. Das Original bleibt geöffnet.
- Prüfung der exakten Taktlängen, Systemzahl und Grenzen; übergreifende Bindungen/Spanner werden gesperrt. Die Quelldefinition von Tonart/Notenschlüssel/Taktart wird an den ersetzten Taktanfängen berücksichtigt.
- Echter JavaScript-Funktionstest einer 49-taktigen Partitur mit Violine und vier gleichzeitig geführten Klavierstimmen (zwei je System) bestanden; die Violine bleibt byteidentisch, zwei Instrumente bleiben zwei. Auch fehlerhafte Grenzen geprüft. Test: `tests/test_replace_polyphonic_part.cjs`.
- **Noch offen:** GitHub-Actions-/MuseScore-Nativtest sowie End-to-End-Aufruf an OpenRouter. Die App wurde nicht veröffentlicht. Änderungen der lokalen Tonart oder von Notenschlüsseln innerhalb des ausgewählten Abschnitts bedürfen zusätzlicher gezielter Tests.

### 2026-10-21 — Kontrolle rhythmischer Auflösung und Pausentakte

- Ein konkreter Datenverlustpfad wurde geschlossen: Beim Übernehmen ursprünglicher MusicXML-Attribute durfte die zeitliche Auflösung `divisions` der erzeugten Noten nicht abweichen. Der vollständige Part-Austausch weist ungleiche Auflösungen nun vor dem Eingriff zurück.
- Die Zahl klingender Takte wird überprüft: Bei mehrtaktigen Bearbeitungen wird eine Ausgabe mit höchstens einem klingenden Takt zurückgewiesen. Einzelne musikalisch gewollte Pausentakte bleiben zulässig.
- Prüfungen für Teilbereich, Taktlänge, Systemzahl sowie Tonart- und Taktartwechsel bestehen weiterhin.
- `tests/test_replace_polyphonic_part.cjs` für 49 Takte erweitert und im JavaScript-Lauf ausgeführt: vier Stimmen, Originalvioline, abweichende divisions und ein zulässiger Pausentakt erfolgreich geprüft.
- Offen: Native MuseScore-End-to-End-Prüfung; keine Freigabe.
