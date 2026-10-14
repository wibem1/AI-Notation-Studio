# v0.10.33 – 14.10.2026

Starter 0.7.25 öffnet ein eigenes Qt-Fenster als Makro statt des MuseScore-ExtensionViewer-Dialogs. Das neue Windows-Protokoll bestätigt, dass auch v0.10.32 die Notationsaktionen im alten Dialog nicht ausführen konnte. MuseScores PluginAPI.cmd und EngravingApiV1.cmd führen beide über denselben Dispatcher; eine andere Fassade löst dessen Kontextprüfung nicht.

Der neue Starter erhält die Partiturseite im MuseScore-URI-Stapel. Sein Fenster ist nicht modal und besitzt keinen impliziten transienten Eltern-Dialog. Die App wird beim normalen Schließen entladen und beim erneuten Start frisch geladen. Während der Korrektur bleibt das Fenster geöffnet. Die App weist einen alten Dialog-Starter vor jeder Mutation mit einer eindeutigen Installationsanweisung zurück.

Installation: MuseScore schließen, beide QML-Dateien aus dem ZIP in den bestehenden Pluginordner kopieren, den Starter ersetzen und MuseScore neu starten. Nur AI-Notation-Studio.qml aktivieren. Ein App-Update allein reicht für den neuen Fensterhost nicht.

Prüfungen: tatsächliche QML-Dateien unter Qt 5.15, Fenster-Lebenszyklus und Größenanpassung, Loader, Update mit Neustart, UI, strukturelle Reparatur, direkte Rücknahme- und Haltebogenregressionen. Native Legacy-QML-Makro-Ausführung mit gewöhnlichem Qt-Fenster unter Linux/MuseScore 4.7.0: vier ausgewählte Takte bearbeitet, zwei Stimmen, 16 Tie-Starts, 20 klingende Ereignisse der Auswahl unverändert, erfolgreicher Prozessabschluss. Der MusicXML-Import/Export verändert außerhalb der Auswahl eine bestehende Oktavierung; deshalb wird keine Identität der vollständigen importierten/exportierten Partitur behauptet. Windows 4.7.5 GUI bleibt zu bestätigen. Keine Nutzerpartitur und kein privates Protokoll werden veröffentlicht.

Quellcodegrundlage: MuseScore v4.7.5, src/framework/extensions/internal/legacy/extpluginsloader.cpp, src/framework/extensions/internal/legacy/extpluginrunner.cpp, src/context/internal/uicontextresolver.cpp und src/notation/internal/notationactioncontroller.cpp.
