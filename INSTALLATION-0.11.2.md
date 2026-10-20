# AI Notation Studio 0.11.2 · 20.10.2026

Korrektur für zusätzliche Stimmen zu längeren Passagen: Bereichsauswahlen speichern nun den tatsächlichen Beginn und das exklusive Ende aus MuseScores Selection-API. Eine Auswahl bis zum Partiturende verwendet das Partiturende. Notenpositionen werden über die Elternkette bis zum Segment gelesen; ganzzahlige Ticks und Fraction-Ticks werden unterstützt. Ungültige Grenzen oder fehlende Dauer brechen vor der KI-Anfrage ab, statt einen Takt anzufordern.

Installation: In der App „Update prüfen“ und „Update installieren“ wählen. Danach muss Version 0.11.2 angezeigt werden.

Validierung: Acht JavaScript-Prüfungen der geänderten Funktionen bestanden (32 Takte trotz einzelner ausgewählter Elemente, exklusives Bereichsende, Partiturende, Noten-Elternkette, Tick 0, Listenauswahl, leere und veraltete Bereichsdaten). Reproduzierbarer Test: node tests/test_selection_bounds.cjs.
Die vollständigen Qt-Tests und der praktische MuseScore-Test konnten in dieser Sitzung wegen der ausgefallenen lokalen Ausführungsumgebung nicht durchgeführt werden.
