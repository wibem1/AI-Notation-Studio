# Illustrierte MuseScore-Partituren – verbindlicher Ablauf

Stand: 15.11.2026. Anwendungsbeispiele: *Schneewittchen* (fünf bzw. sieben Szenen).
Gilt als projektspezifische Arbeitsanweisung für zukünftige illustrierte Notenausgaben. Sie ergänzt [AGENTS.md](AGENTS.md) und die [zentralen Entwicklungsstandards](https://github.com/wibem1/AI-Development-Standards/blob/main/DEVELOPMENT_STANDARDS.md).

## Künstlerisches Konzept

- Die **Originalkomposition bleibt unangetastet**: Tonhöhen, Rhythmen, Stimmen, Artikulation, Tempo, Dynamik, Text und Reihenfolge der Takte erhalten.
- Szenen werden anhand der **wirklich vorhandenen** Überschriften in der hochgeladenen Originalpartitur ermittelt, nicht anhand einer früheren Fassung oder einer Erinnerung.
- Zu jedem Abschnitt eine **eigene, in sich stimmige Illustration**; einheitliche Figurencharakteristik und Bildsprache, zur emotionalen Aussage der Musik passend.
- **Verbindliche Grundregel:** Jede neue Szene beginnt auf einer neuen Seite; das Szenenbild steht oben, die vollständigen Notensysteme beginnen darunter. Die anfängliche Vorgabe einer zentrierten Illustration wurde durch die am 13.11.2026 vom Benutzer **bestätigte Märchenbuch-Gestaltung präzisiert**: bevorzugt **Bild links, eigenständiger typografischer Szenenblock rechts**, statt Bild mittig und Text darunter. Bei anderen Werken kann eine zentrierte Illustration weiterhin bewusst gewählt werden.
- Lange Szenen dürfen auf Folgeseiten weiterlaufen; diese Seiten müssen **keine** Wiederholung der Illustration enthalten. Die nächste Szene beginnt dennoch auf einer neuen Seite.
- Die Bilder sollen die Noten nicht überdecken, Notenschrift und Abschnittstitel müssen gut lesbar sein. Auf sinnvolle Bildgröße, Weißraum und Seitenharmonie achten.
- Ein illustratives Bild einer vollständigen Notenseite ist **niemals** ein Ersatz für die tatsächliche Partitur: Die Noten dürfen nicht bildgeneriert, sondern müssen aus der Originalnotation übernommen werden.

## Bestätigter Gestaltungsstandard: bilddominanter Märchenbuch-Seitenkopf

Dieser Aufbau wurde an der **vollständigen Schneewittchen-Langfassung** durch MuseScore Studio 4.7.6 geprüft und am 13.11.2026 vom Benutzer ausdrücklich als gut bewertet.

**Seitenhierarchie und Satzprinzip:**

1. **Je neue musikalische Szene eine neue Seite**, ohne dass Bild und Noten voneinander getrennt werden. Seitenumbrüche gezielt **nach** dem letzten Takt der Vorgängerszene. Eine lange Szene darf auf weiteren Seiten fortgesetzt werden.
2. Im oberen Seitenbereich steht **links eine deutlich sichtbare, aber nicht übergroße Illustration**, rechts ein schmalerer, typografisch gestalteter Textblock. **Das Bild führt die Wahrnehmung; Schrift ergänzt das Bild**, nicht umgekehrt. Die Größe am gesamten Seitenbild austarieren.
3. Das Bild läuft an seinen äußeren Kanten **sanft, möglichst unregelmäßig und transparent** in den weißen Partiturhintergrund aus. **Keine rechteckigen, scharfen Bildkanten**, sichtbaren Rahmen oder unmotivierte weiße Bildplatten. Wichtige Motive nicht durch Beschnitt verlieren.
4. Der **rechte Textblock** enthält eine zurückhaltende goldfarbene Szenennummer, darunter einen eleganten dunkelblauen, bevorzugt kursiven Szenentitel; bei Bedarf einen grauen kursiven Untertitel bzw. ein kurzes Märchenzitat. Die Zeilenabstände, Textgrößen und x/y-Positionen müssen sorgfältig abgestimmt werden. **EB Garamond** wurde für die bewährte Musterseite verwendet; Font-Verfügbarkeit und Ersatzschrift auf MuseScore.com sind separat zu prüfen.
5. Tempo- und Ausdrucksbezeichnungen stehen gut lesbar am Beginn der Musik. Doppelte Überschriften und störende Überlagerungen vermeiden. **Musikalische Tempo-Ereignisse niemals verändern, nur weil der sichtbare Text gestaltet wird.**
6. Die echten, vollständig spielbaren Notensysteme folgen **unterhalb des Seitenkopfs in normaler Seitenbreite**. **Kein** seitlich verkürztes Notensystem neben dem Bild: Dieser früher getestete Ansatz wurde vom Benutzer verworfen.
7. **Nicht jede Illustration muss genau gleich breit oder hoch sein**: Die relative Bild-/Texthierarchie und der Stil müssen konsistent sein, das Layout darf sich an Motiv und musikalischen Abschnitt anpassen.
8. **Zusätzliche Bildmotive innerhalb einer musikalischen Szene sind erlaubt**, ohne daraus eine künstliche neue Musikszene zu machen. Bei *Schneewittchen* sind es sieben Musikthemen mit acht Illustrationen: Das Apfelmotiv steht am Ende des Zwergenthemas, vor dem folgenden Abschnitt zum gläsernen Sarg.

**Technisch erfolgreiches Verfahren für Bild links / bearbeitbare Texte rechts:**

- Ein **vertikaler Rahmen (`VBox`)** vor dem ersten Takt des Abschnitts; im bestätigten Schneewittchen-Gesamtwerk **42 Spatien Rahmenhöhe** (Musterseite davor 50). Die größere `VBox` ist hier entscheidend; der frühere horizontale `HBox`-Versuch führte zu einem zu kleinen Bild.
- Pro Szene ein **transparentes RGBA-PNG als Montagefläche**, im konkreten Werk **1600 × 650 Pixel**. Im **linken Teil** befindet sich der sanft ausgeblendete **Illustrationsausschnitt, ungefähr 880 × 590 Pixel**; die rechte Fläche bleibt transparent. Die Montage definiert die skalierbare Bildgeometrie; ihre **transparente rechte Hälfte darf nicht den darunterliegenden Text verdecken**.
- Die Abbildung wird als ein natives `Image` in der `VBox` eingebettet, **`autoScale=1`**; Bilddatei wie unten über **MD4 + `Pictures/` + Manifest** referenzieren. Die Szene erhält **zusätzliche separate MuseScore-`Text`-Elemente**, rechts versetzt, mit je eigener Formatierung. **Schrift nicht ins PNG einbrennen**, damit sie im Notenprogramm editierbar bleibt.
- **Bildqualität:** aus hochauflösender Quelle den benötigten Ausschnitt wählen, über Alpha-Maske mit sanftem Rand ins transparente PNG überführen; *das reine Hochskalieren eines kleinen Bildes erzeugt keine neuen Details*. Motive aus einem generierten Notenblatt nur übernehmen, wenn keine gedruckten Fake-Noten oder Beschriftungen im Bildausschnitt verbleiben.
- **Layout bei realem PDF-Export kontrollieren:** Ein technisch gültiger MSCZ-ZIP-Container reicht nicht. Insbesondere korrekte Textformatierung, Zeilenumbrüche, Bildgröße und durchgängiger Seitenfluss müssen im echten MuseScore Studio sichtbar geprüft werden. Beim ersten Gesamtversuch wurden Formatierungsbefehle teilweise als **sichtbarer Text** gedruckt; dies wurde vor Freigabe korrigiert.
- **Konkretes bestätigtes Referenzwerk:** `Schneewittchen_Maerchenbuch_komplett.mscz`, daraus in MuseScore 4.7.6 erzeugtes `Schneewittchen_Maerchenbuch_komplett_Kontrolle.pdf`, **acht Seiten**, sieben Szenenanfänge bei den Takten **1, 13, 21, 33, 39, 55, 67**, zusätzlich Apfelmotiv bei **Takt 52**. Umbrüche nach Takten **12, 20, 32, 38, 51, 54, 66**. Diese Dateinamen beschreiben **frühere Konversationsartefakte**, keine auf GitHub hinterlegten Binärdateien.
- **Nachweis der musikalischen Unversehrtheit:** Referenz und fertige Partitur enthalten jeweils 156 `Measure`-Knoten (78 je Klaviersystem), 1.082 `Note`, 743 `Chord`, 17 `Rest`; die Serien von `Note`, `Chord`, `Rest`, `Articulation`, `Dynamic`, `TimeSig`, `KeySig` wurden kanonisch verglichen und waren unverändert. Sichtbare Abschnitts-/Tempo-**Texte** können aus Layoutgründen angepasst werden, die **wirklichen Tempo-/Notenereignisse nicht**.
- **Stand der Automatisierung:** Das konkrete Gesamtwerk wurde mit einem **werksspezifischen Python-Skript** erstellt, nicht mit einem bereits vollständigen generischen GitHub-Konverter. Die bestehende `illustration-test/illustrate_mscz.py` automatisiert diesen neuen VBox-Montage-/Text-Workflow **noch nicht**. Auch die Darstellung/Abspielbarkeit und Font-Fallbacks nach Upload auf **MuseScore.com** sind **noch nicht nachgewiesen**.

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
5. **Jede Szene mit erzwungenem Seitenbeginn versehen**; bevorzugt den **bilddominanten Seitenkopf mit Illustration links, individuell formatiertem Text rechts und Notensystemen darunter** verwenden (siehe Gestaltungsstandard). Nur bei bewusst abweichender Gestaltung das Bild oben zentrieren. Vor dem letzten Takt der Vorgängerszene keinen Umbruch setzen: Umbruch **nach** dem letzten Takt.
6. Resultat mit einer **echten MuseScore-4-Anwendung** als PDF exportieren. PDF-Seitenzahl und sämtliche Szenenstarts überprüfen, nicht nur ZIP-Struktur oder erfolgreiche Prozessausführung.
7. Visuell kontrollieren: Jede Szene auf eigener Seite, **ausreichend großes Bild mit weichen Rändern links**, übersichtlicher und gegenüber dem Bild zurückhaltender typografischer Block rechts, normale Notensysteme darunter; keine leere Seite, Bild-/Textüberlappung oder harte Bildkanten. Mehrere Seiten pro langer Szene sind zulässig.
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
