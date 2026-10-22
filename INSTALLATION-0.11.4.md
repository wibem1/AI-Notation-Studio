# AI Notation Studio v0.11.4 — Diagnosekorrektur

**Stand:** 22.10.2026. Der unmittelbar vorherige Test der Partitur „Sonatine in g-Moll für Violine und Klavier (mit Akkordsymbolen)“ mit 49 Takten zeigte keinen funktionierenden Ersatz der Begleitung.

## Belegte Ursachen aus der Nutzerdiagnose

- v0.11.3 war installiert, aber der ausgewählte Modus war **Neue Stimme zu Auswahl** (Index 1), während der Nutzer „Erstelle eine interessantere Klavierbegleitung“ beauftragt hatte. Eine bestehende Begleitung wird in diesem Modus **nicht ersetzt**. Das ist eine semantische Fehlbedienung, die die App vor einer kostenpflichtigen Anfrage abfangen muss.
- 49 Takte waren ausgewählt (0–94080 Ticks), der übermittelte CS1-Text war aber in Takt 12 abgeschnitten. Eine vollständig bearbeitete Partitur wurde nicht nachgewiesen.
- Die letzte Modellanfrage meldete 92.641 Eingabe- und 3.919 Ausgabetokens, insgesamt 96.560. Die ursprüngliche Referenzauswahl enthielt 1041 ausformulierte Elementdatensätze; sie verursachte erheblichen unnötigen Kontext.
- Preis und Rechnung waren laut Diagnose unbekannt und dürfen nicht als 0 Kosten ausgegeben werden.

## Änderungen in v0.11.4

- Modus 1 verweigert Änderungs-/Ersetzungsaufträge wie „Erstelle eine interessantere Klavierbegleitung“ **vor dem Aufruf des KI-Anbieters**, mit Hinweis auf den richtigen Modus **Instrumentpart ersetzen (mehrstimmig)**. Der Modus Neue Stimme bleibt für echte Ergänzungen erhalten.
- Die aufwendige JSON-Referenzauswahl wird vor dem Versenden zu einem kompakten takt-/spurbezogenen musikalischen Überblick reduziert; lokale Partitur und Diagnose bleiben vollständig. Die Kontextgröße wird begrenzt, statt Tausende GUI-Elemente und redundante Felder mitzuschicken.
- Regression `tests/test_prompt_routing.py` prüft die reale Formulierung und das kompakte Promptformat. Bestehende QML-, MusicXML- und Windows-Update-Tests bleiben Teil der automatisierten Pipeline.
- Die Prüfung auf vollständige Ergebnis-Taktzahl bleibt aktiv; ein abgeschnittenes Ergebnis wird nicht in die Partitur übernommen.

## Update

In AI Notation Studio **Update prüfen** → **Update installieren** wählen. Quelle: `AI-Notation-Studio-App.qml` auf `main`, Archiv: `versions/AI-Notation-Studio-App-0.11.4.qml`.

## Einschränkung

Auch die erfolgreiche GitHub-Regression beweist nicht, dass das Generieren von 49 komplexen Takten mit dem externen Modell in einem einzigen Aufruf vollständig gelingt. Native MuseScore- und echte OpenRouter-/Google-End-to-End-Tests wurden nicht durchgeführt. Das Update behebt die nachgewiesene falsche Moduszuordnung und das unnötige Promptvolumen; es garantiert **noch keinen vollständigen 49-Takte-KI-Durchlauf**. 
