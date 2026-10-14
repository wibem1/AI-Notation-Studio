# AI Notation Studio v0.10.31 – 14.10.2026

Nach dem Klick auf die direkte Korrektur verschwand laut Nutzer das Pluginfenster, während MuseScore geöffnet blieb. 0.10.30 blendete den nativen Host mit window.hide() aus, bevor ein Timer die Korrektur ausführte und das Fenster wieder zeigen sollte. 0.10.31 entfernt sowohl das Ausblenden als auch den Timer. Der Adapter selbst bleibt unverändert gegenüber 0.10.30; keine neue Partitur wird über den direkten Button geöffnet.

Die direkte Funktion setzt busy erst innerhalb ihres Ausführungsblocks und räumt es im finally auf. Fehler bleiben in structureStatus und structureReport sichtbar. Der Korrekturplan bleibt bei Fehlern erhalten.

Bestanden: Qt-5-UI-Test des tatsächlichen Buttons und Hostfensters (sichtbar, unverändert geladen, Fehlerstatus, busy zurückgesetzt), Loader, Update/Neustart 0.10.30 → 0.10.31, Struktur-/Adaptertests und Test des unmittelbaren Aufrufs ohne Window.hide/Timer. Dies sind Qt-Tests mit MuseScore-Testobjekten; das tatsächliche Windows-MuseScore-Hostverhalten und die konkrete Schneewittchen-Partitur sind noch nicht getestet. Die bislang beobachtete Hostlebensdauer-Ursache ist eine plausible Erklärung, keine bestätigte native Stacktrace-Diagnose.
