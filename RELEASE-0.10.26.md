# AI Notation Studio 0.10.26

Fixes the scope of notation review: 0.10.25 primarily reviewed enharmonic spelling and missed tangled multi-voice accompaniment.

The primary Notendarstellung prüfen action now performs a deterministic structural review without an AI call. In full selected measures of one instrument, simple passages with three or four pitched voices and an identifiable sustained bass can be reduced to two voices: bass and chordal upper accompaniment. Durations are subdivided and tied where required. Enharmonic spelling review remains a separate AI action.

The engine validates sounding pitches, onsets, tie-chain durations and note dynamics against the original whole score before offering a preview. Unsupported notation, overlapping equal upper pitches, ambiguous bass crossings and unrepresentable durations are skipped. This is an optional accompaniment simplification, not a blanket rewrite of contrapuntal voices or a page-collision detector.

Korrigierte Partitur als Vorschau öffnen imports a separate MusicXML score after checking the original full-score export and selection are still unchanged. The original stays open. Review the imported layout and performance before saving; MusicXML may change MuseScore-specific engraving. Mark full measures of one instrument, then Update prüfen → Update installieren to load this version.

Validation: all four reported example measures; whole-score acoustic signature equality and untouched measures; MusicXML schema; generic regression fixture in tests/test_notation_structure.js; unsupported slur, partial-measure and invalid-range exclusions; actual QML workflow through export/preview and stale-score rejection using substitutes; Qt 6 QML/UI; old updater recognition and live-activation simulation. The resulting passage was visually inspected using Verovio. Native MuseScore background export crashed in this environment; native preview interaction remains unverified.

No user diagnostic or score was committed to the repository.
