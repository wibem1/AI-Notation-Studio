// Isolated MuseScore Studio 4.7.x API probe; NOT a production plugin.
// Run ONLY with a disposable, already saved test score (never the user's original).
import QtQuick 2.2
import MuseScore 3.0
import FileIO 3.0

MuseScore {
    menuPath: "Plugins.AI Notation Studio Tests.Native measure insertion probe"
    description: "Checks beginning-of-score insertion and rollback on a DISPOSABLE test score"
    version: "0.0.1-spike"
    requiresScore: true
    property string probeTranscript: ""
    FileIO { id: nativeLog; source: "/tmp/ans-native-result.txt" }
    function trace(message) {
        probeTranscript += message + "\n"
        nativeLog.write(probeTranscript)
        console.log(message)
    }

    function fail(message) { throw new Error(message) }
    function snapshot(score, stage) {
        // Export is observational; the original score remains the transaction target.
        var target = "/tmp/ans-native-" + stage + ".musicxml"
        if (!writeScore(score, target, "musicxml"))
            fail("Cannot export " + stage + " MusicXML")
        trace("ANS_NATIVE_SNAPSHOT " + stage + " " + target)
    }
    function inspect(score, stage) {
        if (!score || !score.firstMeasure || score.nmeasures < 1) fail(stage + ": no usable score")
        var result = {
            stage: stage,
            measures: Number(score.nmeasures),
            staves: Number(score.nstaves),
            firstTick: Number(score.firstMeasure.firstSegment ? score.firstMeasure.firstSegment.tick : 0)
        }
        trace("ANS_NATIVE_PROBE " + JSON.stringify(result))
        return result
    }

    onRun: {
        // This is a deliberately LIMITED proof: no CS1 transfer, no production installation.
        // The host is responsible for selecting ONLY a sacrificial score before invoking it.
        trace("ANS_NATIVE_PROBE START")
        var score = curScore
        var started = false
        var initial = null
        try {
            if (!score) fail("No score")
            // Deliberate opt-in: only sacrificial scores named ANS-TEST-* may be mutated.
            var title = String(score.metaTag("workTitle") || "")
            if (title.indexOf("ANS-TEST-") !== 0)
                fail("Safety guard: set disposable score workTitle to ANS-TEST-* first")
            if (score.nstaves < 1 || score.nmeasures < 2)
                fail("Test score must have >=1 staff and >=2 measures")
            initial = inspect(score, "before")
            snapshot(score, "before")
            var selectRange = score.selection && score.selection.selectRange
            if (typeof selectRange !== "function")
                fail("Selection.selectRange unavailable; safe abort before mutation")
            // Full first measure across every staff; selectRange endStaff is exclusive.
            var cursor = score.newCursor()
            cursor.rewind(0)
            var startTick = Number(cursor.tick)
            cursor.nextMeasure()
            var endTick = Number(cursor.tick)
            if (!isFinite(startTick) || !isFinite(endTick) || endTick <= startTick)
                fail("Could not determine full first-measure selection")
            score.selection.clear()
            score.selection.selectRange(startTick, endTick, 0, score.nstaves)
            if (!score.selection.isRange)
                fail("Failed to select first measure; abort before mutation")
            score.startCmd("AI Notation Studio native insert test")
            started = true
            cmd("insert-measure")
            var after = inspect(score, "after-insert")
            snapshot(score, "after")
            if (after.measures !== initial.measures + 1 || after.staves !== initial.staves)
                fail("Insertion structural postcondition failed")
            // The probe ALWAYS rolls back. It must never leave a newly inserted measure.
            score.endCmd(true)
            started = false
            var restored = inspect(score, "after-rollback")
            snapshot(score, "rollback")
            if (restored.measures !== initial.measures || restored.staves !== initial.staves)
                fail("CRITICAL: rollback did not restore measure/staff counts")
            // Separate committed transaction, so MuseScore export can observe finalized score state.
            score.selection.clear()
            score.selection.selectRange(startTick, endTick, 0, score.nstaves)
            if (!score.selection.isRange) fail("Cannot reselect first measure for committed check")
            score.startCmd("AI Notation Studio native committed insert test")
            started = true
            cmd("insert-measure")
            if (Number(score.nmeasures) !== initial.measures + 1)
                fail("Committed check: insertion did not change measure count")
            score.endCmd(false)
            started = false
            snapshot(score, "committed")
            cmd("undo")
            var afterUndo = inspect(score, "after-undo")
            if (afterUndo.measures !== initial.measures)
                fail("Undo command did not restore original count")
            snapshot(score, "undo")
            trace("ANS_NATIVE_PROBE PASS: native rollback and committed insertion plus one undo; check MusicXML separately")
        } catch (e) {
            trace("ANS_NATIVE_PROBE FAIL: " + String(e))
            if (started) {
                try { score.endCmd(true) }
                catch (rollbackError) { trace("ANS_NATIVE_PROBE ROLLBACK_ERROR " + rollbackError) }
            }
        } finally {
            // Selection may be changed by the probe; never make a claim of UI/selection rollback.
            Qt.quit()
        }
    }
}
