# AI Notation Studio 0.11.1 · 19.10.2026

Normal installieren: In AI Notation Studio **Update prüfen** und anschließend **Update installieren** wählen. Das bestehende Updateverfahren lädt die neue App. Die App aktualisiert auch den Starter auf 0.7.27 und bewahrt dessen bisherige Datei als Sicherung auf.

Bei älteren Versionen unter Qt 6 kann der erste Versuch „File name case mismatch“ melden. Die Datei ist dann bereits gespeichert: MuseScore einmal vollständig schließen, neu starten und **Update prüfen → installieren** erneut ausführen. Es müssen keine Dateien von Hand kopiert werden. Ab 0.11.1 umgeht der Updateweg diesen Qt-Dateicache und prüft weiterhin Version, QML und Start der neuen App.

Neu: Analyse → Überarbeitung mit freier Modellwahl, gespeicherte Vorschläge mit Originalprüfung, Verlauf einschließlich Analysen und ungültiger Antworten, optional zwei/drei/vier freigegebene Schlusstakte als Übergang. Übergangstakte zählen zusätzlich zu den verlangten neuen Takten. Überarbeitungen werden als neue Partitur geöffnet; die Originalpartitur bleibt erhalten.

Für Überarbeitungen aus einer Analyse vollständige Takte markieren. Überspannende Bögen/Spielanweisungen können den Vorgang blockieren. Das vorhandene Auftragsfeld nimmt konkrete Änderungswünsche auf. Eine neue Überarbeitung ist ein zusätzlicher KI-Aufruf; das Laden aus dem Verlauf verursacht keinen KI-Aufruf.

Automatisch geprüft: alter Updateweg aus 0.10.33, neuer Updateweg, Versionskontrolle, fehlgeschlagenes QML, neuer Starter, Schließen/Öffnen im selben Qt-Prozess und vollständiger Neustart mit Qt 5 und Qt 6. Der praktische MuseScore- und Hörtest dieser Fassung steht aus.
