// ISOLATED SPIKE ONLY. Not a production plugin; never run on a user's score.
// Tests writing one pitched note into a newly prepended measure, then Undo.
// Use ONLY a disposable score whose workTitle starts with ANS-TEST-.
import QtQuick 2.2
import MuseScore 3.0
import FileIO 3.0

MuseScore {
    menuPath: "Plugins.AI Notation Studio Tests.Native first note probe"
    description: "Disposable score only: insert measure and a note, verify then undo"
    version: "0.0.1-spike"
    requiresScore: true
    property string transcript: ""
    FileIO { id: logFile; source: "/tmp/ans-note-result.txt" }
    function log(message) {
        transcript += message + "\n"
        logFile.write(transcript)
        console.log(message)
    }
    function fail(message) { throw new Error(message) }
    function save(score, stage) {
        if (!writeScore(score, "/tmp/ans-note-" + stage + ".musicxml", "musicxml"))
            fail("MusicXML export failed at " + stage)
    }
    onRun: {
        var score = curScore
        var active = false
        var committed = false
        try {
            if (!score || String(score.metaTag("workTitle") || "").indexOf("ANS-TEST-") !== 0)
                fail("Only disposable ANS-TEST-* score permitted")
            if (score.nmeasures !== 4 || score.nstaves !== 3)
                fail("Expected 4-measure, 3-staff complex fixture; refuse other scores")
            if (!score.selection || typeof score.selection.selectRange !== "function")
                fail("Range selection unavailable")
            var cur = score.newCursor()
            cur.rewind(0)
            var firstTick = Number(cur.tick)
            cur.nextMeasure()
            var endTick = Number(cur.tick)
            if (!isFinite(firstTick) || !isFinite(endTick) || endTick <= firstTick)
                fail("Invalid first measure boundaries")
            save(score, "before")
            score.selection.clear()
            score.selection.selectRange(firstTick, endTick, 0, score.nstaves)
            if (!score.selection.isRange) fail("Cannot select first measure")
            score.startCmd("ANS native first note disposable probe")
            active = true
            cmd("insert-measure")
            if (score.nmeasures !== 5 || score.nstaves !== 3)
                fail("Native prepend failed")
            // Only the first staff/first voice: no claim about transferring chords,
            // polyphony, pedal, tuplets, ties or other MusicXML element types.
            var writer = score.newCursor()
            writer.staffIdx = 0
            writer.voice = 0
            writer.rewind(0)
            writer.setDuration(1, 4)
            writer.addNote(72, false) // C5 quarter note
            if (score.nmeasures !== 5) fail("Writing note altered measure count")
            score.endCmd(false)
            active = false
            committed = true
            save(score, "committed")
            // One native undo must remove BOTH the inserted bar and the note.
            cmd("action://notation/undo")
            // Never undo a second time if export/verification fails after undo.
            committed = false
            save(score, "undo")
            if (score.nmeasures !== 4 || score.nstaves !== 3)
                fail("One-step undo did not restore original structure")
            committed = false
            log("ANS_NOTE_PROBE PASS: structural checks; XML content must be verified independently")
        } catch (e) {
            log("ANS_NOTE_PROBE FAIL: " + String(e))
            if (active) {
                try { score.endCmd(true) } catch (rollbackError) {
                    log("ANS_NOTE_PROBE ROLLBACK_ERROR: " + rollbackError)
                }
            }
            // If the transaction was committed but the operation failed later,
            // attempt a single undo. The disposable source file is the ultimate backup.
            else if (committed) {
                try { cmd("action://notation/undo") } catch (undoError) {
                    log("ANS_NOTE_PROBE UNDO_ERROR: " + undoError)
                }
            }
        } finally {
            Qt.quit()
        }
    }
}
