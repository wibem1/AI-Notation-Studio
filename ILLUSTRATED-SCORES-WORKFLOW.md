# Illustrierte MuseScore-Partituren – verbindlicher Ablauf

Stand: 13.11.2026. Anwendungsbeispiele: *Schneewittchen* (fünf bzw. sieben Szenen).
Gilt als projektspezifische Arbeitsanweisung für zukünftige illustrierte Notenausgaben. Sie ergänzt [AGENTS.md](AGENTS.md) und die [zentralen Entwicklungsstandards](https://github.com/wibem1/AI-Development-Standards/blob/main/DEVELOPMENT_STANDARDS.md).

## Künstlerisches Konzept

- Die **Originalkomposition bleibt unangetastet**: Tonhöhen, Rhythmen, Stimmen, Artikulation, Tempo, Dynamik, Text und Reihenfolge der Takte erhalten.
- Szenen werden anhand der **wirklich vorhandenen** Überschriften in der hochgeladenen Originalpartitur ermittelt, nicht anhand einer früheren Fassung oder einer Erinnerung.
- Zu jedem Abschnitt eine **eigene, in sich stimmige Illustration**; einheitliche Figurencharakteristik und Bildsprache, zur emotionalen Aussage der Musik passend.
- **Verbindliche Layoutregel (Benutzerwunsch vom 13.11.2026): Jede neue Szene beginnt auf einer neuen Seite. Ihre Illustration steht oben auf dieser Seite, möglichst horizontal zentriert.** Die Noten der Szene beginnen darunter.
- Lange Szenen dürfen auf Folgeseiten weiterlaufen; diese Seiten müssen **keine** Wiederholung der Illustration enthalten. Die nächste Szene beginnt dennoch auf einer neuen Seite.
- Die Bilder sollen die Noten nicht überdecken, Notenschrift und Abschnittstitel müssen gut lesbar sein. Auf sinnvolle Bildgröße, Weißraum und Seitenharmonie achten.
- Ein illustratives Bild einer vollständigen Notenseite ist **niemals** ein Ersatz für die tatsächliche Partitur: Die Noten dürfen nicht bildgeneriert, sondern müssen aus der Originalnotation übernommen werden.

## Technisch bestätigter Kern: MuseScore 4.7.6

Die MSCZ-Datei ist ein ZIP-Container mit einer MSCX-Datei (Noten-XML), `META-INF/container.xml` und Bildern unter `Pictures/`.

- MuseScore 4.7.6 identifiziert gespeicherte Bilder über **MD4 des tatsächlichen Bild-Byteinhalts**, nicht MD5. Beleg: `musescore/MuseScore`, Version `v4.7.6`, `src/engraving/dom/imageStore.cpp`, `ImageStore::add()` / `ImageStoreItem::hashName()`.
- Bildname: `<32-hex-stellige-MD4-Prüfsumme>.png` (oder .jpg/.jpeg), Daten unter `Pictures/<Name>` ablegen und im Container-Manifest als Datei registrieren.
- In `<VBox><Image><path>...</path>...</Image></VBox>` steht bei `path` **nur** der Hashdateiname ohne `Pictures/`.
- Die Bildrahmen (`VBox`) stehen vor dem ersten `Measure` der jeweiligen Szene im ersten musikalischen `Staff`. **Die genaue Bildgröße und Zentrierung sind am gerenderten Ergebnis zu kontrollieren.** Ein ZIP-Eintrag oder bloße Bildreferenz beweist keine korrekte Darstellung.
- Für Szenenwechsel: expliziter `<LayoutBreak><subtype>page</subtype></LayoutBreak>` **am Ende des letzten Takts der vorherigen Szene**. Bereits vorhandene Zeilen- und Seitenumbrüche prüfen; Doppelumbrüche, leere Zwischenblätter und Kollisionen vermeiden.
- Achtung: Nicht versehentlich die `score_style.mss` (Stildatei) als die `.mscx` (Notendaten) verarbeiten. Im Archiv gezielt nach der MSCX suchen und die Existenz von `Score/Staff/Measure` prüfen.

### Vorhandene Werkzeuge (derzeit auf Experimentierbranch `experiment/illustrated-mscz-20261113`; noch nicht auf `main` übernommen)

- `illustration-test/illustrate_mscz.py`: CLI zum Einfügen von Bildern vor Takten in eine Kopie einer MSCZ. Der vorhandene Code fügt **nicht automatisch** alle Seitenumbrüche und die geprüfte horizontale Zentrierung ein. Diese zusätzliche Layoutautomatik ist der nächste Entwicklungsbedarf.
- `.github/workflows/illustrated-mscz-feasibility.yml`: nativer CI-Test mit MuseScore 4.7.6, MSCZ- und PDF-Export und farbigem Bild-Pixeltest.
- Bewiesener Durchbruch: [GitHub-Actions-Lauf #43396235626](https://github.com/wibem1/AI-Notation-Studio/actions/runs/43396235626) **SUCCESS** für eine synthetische Ein-Bild-Partitur.
- `PROJECT_STATE.md`: nach jedem bestätigten Entwicklungsschritt nachtragen. Der veröffentlichte App-Code bleibt unverändert, solange die Illustrationstechnik eigenständig getestet wird.

## Wiederholbarer Ablauf für ein neues Werk

1. **Original-MSCZ sichern**, niemals überschreiben. Falls MusicXML als Quelle vorliegt, zunächst nativ mit MuseScore zu MSCZ konvertieren; Bilder nicht allein über MusicXML transportieren.
2. Original-MSCX auslesen: vollständige Szenentitel, erster Takt jeder Szene, Anzahl der Takte und Noteneinträge, vorhandene Rahmen und Layoutumbrüche, Titel/Komponistenangaben.
3. Für jede Szene eigene Illustration erstellen; Motive, Personen, Stil und Stimmung aufeinander abstimmen; Bilddateien getrennt behalten.
4. Bilder über korrekte MD4-Namen, `Pictures/`, Manifest und `VBox/Image` in eine **neue** MSCZ integrieren.
5. **Jede Szene mit erzwungenem Seitenbeginn versehen**; Bild **oben, möglichst mittig** auf der ersten Szenenseite positionieren; Szenenüberschrift und Noten darunter. Vor dem letzten Takt der Vorgängerszene keinen Umbruch setzen: Umbruch **nach** dem letzten Takt.
6. Resultat mit einer **echten MuseScore-4-Anwendung** als PDF exportieren. PDF-Seitenzahl und sämtliche Szenenstarts überprüfen, nicht nur ZIP-Struktur oder erfolgreiche Prozessausführung.
7. Visuell kontrollieren: sieben Szenen → sieben Szenenstarts jeweils auf eigenständigen Seiten; Bild nicht nach unten oder rechts verrutscht; keine leere Seite; kein Bild über Noten; lesbares Satzbild; mehrere Seiten pro längerer Szene sind zulässig.
8. Musikalische Integrität automatisiert kontrollieren: Nach Entfernung aller hinzugefügten `VBox/Image`-Elemente und LayoutBreaks muss die musikalische MSCX-Struktur mit der Basispartitur übereinstimmen. Gegebenenfalls bestehende Seiteneinstellungen und Titelrahmen separat vergleichen. Zusätzlich Noten- und Taktzahlen kontrollieren.
9. Ausgabe: native **MSCZ** und PDF-Kontrollfassung; erst dann zur Veröffentlichung auf MuseScore.com weitergeben. Website-Darstellung und Abspielbarkeit nach Upload separat prüfen.
10. Erfolg, Grenzen, Testergebnisse und ggf. Layoutanpassungen in `PROJECT_STATE.md` dokumentieren.

## Fehlerfälle und Lösungen

| Beobachtung | Ursache / Maßnahme |
|---|---|
| Bild im Archiv, aber nicht in MuseScore | MD4 statt MD5, `Image/path`, `Pictures/` und Container-Manifest prüfen |
| MSCX scheint keine Noten zu haben | Womöglich versehentlich `score_style.mss` statt der eigentlichen `.mscx` gelesen |
| MuseScore startet auf Linux-CI nicht | Für AppImage passende EGL-/OpenGL-/FUSE-Laufzeitbibliotheken installieren |
| GitHub-API-Rate-Limit | Authentifizierte Release-Abfrage verwenden |
| Bild erscheint mitten auf der Seite | Seitenumbruch nach dem vorherigen Szenenende, Bildrahmen vor den ersten Takt, PDF anschließend prüfen |
| Bild nicht mittig | VBox/Image-Einstellungen bzw. horizontale Ausrichtung korrigieren und in echtem MuseScore-PDF prüfen. Aktuelle CLI garantiert Zentrierung **noch nicht** |
| Bild zu groß, Noten verdrängt | Rahmenhöhe und Bildgröße reduzieren, ggf. restliche Szene auf Folgeseite fortsetzen |
| Leere Seiten oder seltsame Umbrüche | Bestehende LayoutBreaks erkennen und nicht blind zusätzliche setzen |

## Übergabehinweis

Bei einem neuen Auftrag „Komposition illustrieren“ diese Datei **zuerst zusammen mit `AGENTS.md` und `PROJECT_STATE.md` lesen**. Keine der bisherigen KI-Konversationen ist die verbindliche technische Dokumentation. Bilder und konkrete Partituren sind individuelle Eingaben; das Verfahren ist wiederverwendbar. Nicht behaupten, automatische Zentrierung oder Seitenwechsel seien durch die eingecheckte CLI bereits voll implementiert.
