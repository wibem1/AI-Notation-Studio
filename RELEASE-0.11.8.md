# AI Notation Studio v0.11.8 – 24.10.2026

Pfeiltasten-Scrollen im eigenständigen Pluginfenster korrigiert. In v0.11.7 funktionierte es nur, wenn der Scrollbereich selbst die Tastatureingabe erhielt. Jetzt reagieren Pfeil hoch und Pfeil herunter auch bei Fokus im äußeren Fenster oder auf einer Schaltfläche. In Textfeldern und Auswahlfeldern bleibt deren normale Bedienung erhalten; Dialoge blockieren das Scrollen des Hintergrunds.

Installation: **Update prüfen → Update installieren**. Kein neuer Starter erforderlich. KI-/Modellanzeige und Startkorrektur aus v0.11.7 bleiben erhalten.

Nachweis: Neuer Test im echten Qt-Starterfenster reproduziert den Fehler mit unveränderter v0.11.7 und besteht mit v0.11.8. Weitere Qt-Oberflächen- und Update-/Neustarttests unter Windows mit Qt 6.12.0 bestanden. MuseScore-API durch vorhandene Testmodule ersetzt; Bestätigung im echten MuseScore durch den Nutzer steht aus.

