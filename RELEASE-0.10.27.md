# AI Notation Studio 0.10.27

Adds direct correction in the currently open MuseScore score. Select complete measures of one instrument, run Notendarstellung prüfen, then In der Partitur korrigieren. The direct path does not call readScore, create a new score or use the clipboard.

The structural engine prepares exact chord/rest operations. The native adapter preserves source note spelling, velocity, play state, visibility and color; rewrites only affected staves/measures; hides obsolete rests in secondary voices; and creates ties with the native tie action. It checks every note duration and tie endpoint and compares the exported whole-score sounding-note signature against the original before committing.

MuseScore 4.7 or newer is required because its Score.startCmd locks a single undo macro (including cmd actions) and Score.endCmd(true) rolls back that macro. All changes are committed as one undoable action. Any insertion, tie, playback-property or whole-score validation failure rolls back the transaction. Transposing, microtonal, cross-staff, decorated and muted-voice cases are excluded. Ties across an affected measure boundary are conservatively rejected; this limitation remains even when more measures are selected.

Validation: structural example and generic regression tests; direct native-API substitutes covering notes/chords/rests, ties, velocity, hidden obsolete rests, single transaction, rollback on failed ties and full-score check, and preflight exclusion; Qt 6 QML/UI compilation. The direct workflow has not yet completed a native MuseScore execution in this environment (earlier background runs crashed). Validation/rollback guards remain active; a failed native action must report failure rather than claim success.

Native API contracts checked against MuseScore v4.7.0 src/engraving/api/v1/score.cpp, cursor.cpp, selection.cpp and qmlpluginapi.cpp. No user score or diagnostic is included in this release.
