# AI Notation Studio 0.11.0 · Testversion · 19.10.2026

1. AI Notation Studio und MuseScore schließen. Den bisherigen Plugin-Ordner sichern.
2. Die drei QML-Dateien aus dem Paket in denselben bisherigen Plugin-Ordner kopieren und vorhandene gleichnamige Dateien ersetzen.
3. MuseScore starten und weiterhin **AI Notation Studio** aufrufen. Der Starter lädt App 0.11.0. Nur den Starter im Plugin-Manager aktivieren.

Neue Bedienung:

- Analyse erstellen; danach bei Bedarf ein anderes Modell wählen und **Überarbeitung aus Analyse erstellen** drücken. Hierfür vollständige Takte markieren. Für konkrete Wünsche dient weiterhin das vorhandene Auftragsfeld. Das Erstellen der Überarbeitung ist ein zusätzlicher KI-Aufruf.
- Das Ergebnis bleibt zunächst ein Vorschlag. **Fertige Fassung in MuseScore öffnen** öffnet eine neue Partitur mit der Überarbeitung; die Originalpartitur bleibt erhalten.
- Bei **Fortsetzen** lässt sich unter **Übergang** der Schluss erhalten oder die letzten zwei/drei/vier Takte neu gestalten. Bei 16 verlangten neuen Takten und zwei Übergangstakten liefert die KI 18 Takte: zwei Ersatz- und 16 neue Takte.
- Der Verlauf enthält auch Analysen und fehlerhafte Antworten. Das Laden verursacht keinen KI-Aufruf. Die Originalmusik wird mitgesichert; zum Anwenden einer geladenen Bearbeitung muss die passende Originalpartitur geöffnet sein.

Vollständige Taktgrenzen und dieselbe Besetzung sind Voraussetzung für Überarbeitungen. Bögen und Spielanweisungen über der Grenze können den Vorgang blockieren. Nach einer Änderung der Originalmusik neu analysieren bzw. den Auftrag neu starten. MusicXML kann das Layout der neuen Partitur verändern.

Der Kern, die Notenübernahme, MusicXML und die Oberfläche sind automatisch geprüft. Der praktische Test mit echten MuseScore-Partituren sowie ein Hörtest stehen aus. Diese Testfassung wurde nicht über den bestehenden Online-Updater veröffentlicht.

Hot-Update und Neustart sind unter Qt 5 geprüft. Im zusätzlichen Qt-6.12/Linux-Test besteht ein Problem beim Nachladen neu geschriebener QML-Dateien. Für diesen Kandidaten deshalb wie oben beschrieben manuell installieren.
