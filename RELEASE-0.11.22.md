# AI Notation Studio 0.11.22 – KI-Neunotation (9. November 2026)

## Neuer Korrekturweg

Der Hauptknopf **„Notation verbessern (KI, API-Kosten)“** verlangt eine vollständige **neu notierte MusicXML-Fassung** von der gewählten KI. Das Modell liefert nicht mehr nur einen Fehlerbericht. Das Plugin übernimmt genau die markierten Takte in eine Kopie der vollständigen Partitur; andere Instrumente und Takte bleiben aus dem Original erhalten.

**Anwendung:** Sämtliche Systeme eines Instruments und 1–12 vollständig begrenzte Takte auswählen → „Notation verbessern (KI, API-Kosten)“ → Bericht und Sicherheitsprüfung abwarten → „KI-Korrektur als Partiturkopie öffnen“ → das Notenbild in MuseScore vergleichen und bei Bedarf die Kopie speichern. Das Original wird nicht überschrieben. Nur der explizite KI-Klick verursacht mögliche Providerkosten; keine automatische kostenpflichtige Wiederholung.

## Sicherungen

- Nur angeforderte Taktindizes und vollständig übereinstimmende Taktnummern erlaubt.
- Identische klingende Tonhöhen, Einsätze und Dauern erforderlich.
- Schutz ausgewählter Ausdruckszeichen, Dynamik, Artikulation, Tonart, Taktart und Transposition.
- Geänderte Partitur oder Auswahl während der KI-Antwort verhindert eine Übernahme.
- Import als zweite Partitur, keine unkontrollierte Änderung des Originals.
- 1–12 vollständige Takte, alle Systeme des gewählten Instruments, KI-Ausschnitt höchstens 36.000 Zeichen.

## Teststand und ausdrücklich verbleibende Unsicherheit

- **Bestanden:** Offline-Regression für gültige und ungültige KI-MusicXML-Antworten; bestehende Fortsetzungs-Regression; nativer MuseScore-4.7.6-Test der gemeinsamen Antwortprüfung mit simuliertem KI-JSON und echtem Öffnen der MusicXML-Partiturkopie. Nachweis: [Native #42567171276](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42567171276), [Notation #42567171271](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42567171271), [Fortsetzung #42567171304](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42567171304). Weitere erfolgreiche native Kopieöffnung: [#42566891516](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42566891516).
- Die spätere CI-Prüfung [#42567340227](https://github.com/wibem1/AI-Notation-Studio/actions/runs/42567340227) scheiterte **vor dem Pluginstart** an HTTP 504 beim Download von MuseScore; dies ist kein nachgewiesener Programmfehler.
- **Noch nicht geprüft:** eine **echte kostenpflichtige Providerantwort**, deren notensatztechnische Qualität, vollständiger Workflow mit einem echten Modell und der praktische Einsatz unter macOS/Windows beim Nutzer. Die neue KI-Korrektur ist deshalb funktional ein **Praxistest / experimentell** und nicht als musikalisch zuverlässig bestätigt.
- MusicXML-Signaturgleichheit stellt keine perfekte musikalische oder grafische Lesbarkeit sicher. Speziell eigenständige Stimmen, Verzierungen und Pausen müssen optisch beurteilt werden.

## Kompatibilität

Die sicheren kostenlosen Struktur-, Schlüssel- und Achtelbalkenkorrekturen von 0.11.21 bleiben erhalten. Die bisherigen Funktionen für Komposition, Fortsetzung, Diagnose und Dateiausgabe sind nicht bewusst entfernt worden. Alte versionierte Programmdateien bleiben unverändert.
