# AI Notation Studio 0.10.25

The new Notendarstellung panel examines selected notation using the configured AI provider. It shows a German report and a preview of enharmonic respellings before applying them as one undoable MuseScore command.

Pitch, onset, duration and voice are preserved. Proposed respellings are validated; tied notes, grace notes and transposing spellings are excluded. Changed selections are rejected before application.

Voice distribution, rests, beams and rhythmic structure are discussed in the report but are not automatically rewritten in this first stage. The analysis uses score data, not rendered page geometry. Review the musical spelling before applying proposals. Normal API costs apply.

Install through Update prüfen → Update installieren. The existing updater downloads AI-Notation-Studio-App.qml and loads the versioned component.

Validation: Qt 5/6 QML loading with MuseScore substitutes; Qt 6 visual rendering; proposal validation, unchanged pitch, stale selection/duration rejection, rollback and protected-note checks; 0.10.24 updater recognition and FileIO/live-load simulation. No live provider call or native MuseScore mutation was tested.
