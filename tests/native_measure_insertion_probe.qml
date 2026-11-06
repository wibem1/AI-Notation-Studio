// Isolated MuseScore Studio 4.7.x API probe; NOT a production plugin.
// Run ONLY with a disposable, already saved test score (never the user's original).
import QtQuick 2.2
import MuseScore 3.0

MuseScore {
    menuPath: "Plugins.AI Notation Studio Tests.Native measure insertion probe"
    description: "Checks beginning-of-score insertion and rollback on a DISPOSABLE test score"
    version: "0.0.1-spike"
    requiresScore: true

    function fail(message) { throw new Error(message) }
    function inspect(score, stage) {
        if (!score || !score.firstMeasure || score.nmeasures < 1) fail(stage + ": no usable score")
        var result = {
            stage: stage,
            measures: Number(score.nmeasures),
            staves: Number(score.nstaves),
            firstTick: Number(score.firstMeasure.firstSegment ? score.firstMeasure.firstSegment.tick : 0)
        }
        console.log("ANS_NATIVE_PROBE " + JSON.stringify(result))
        return result
    }

    onRun: {
        // This is a deliberately LIMITED proof: no CS1 transfer, no production installation.
        // The host is responsible for selecting ONLY a sacrificial score before invoking it.
        var score = curScore
        var started = false
        var initial = null
        try {
            if (!score) fail("No score")
            if (score.nstaves < 1 || score.nmeasures < 2)
                fail("Test score must have >=1 staff and >=2 measures")
            initial = inspect(score, "before")
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
            if (after.measures !== initial.measures + 1 || after.staves !== initial.staves)
                fail("Insertion structural postcondition failed")
            // The probe ALWAYS rolls back. It must never leave a newly inserted measure.
            score.endCmd(true)
            started = false
            var restored = inspect(score, "after-rollback")
            if (restored.measures !== initial.measures || restored.staves !== initial.staves)
                fail("CRITICAL: rollback did not restore measure/staff counts")
            console.log("ANS_NATIVE_PROBE PASS: insert one before-first measure and rollback; " +
                        "note/spanner signature verification STILL REQUIRED")
        } catch (e) {
            console.log("ANS_NATIVE_PROBE FAIL: " + String(e))
            if (started) {
                try { score.endCmd(true) }
                catch (rollbackError) { console.log("ANS_NATIVE_PROBE ROLLBACK_ERROR " + rollbackError) }
            }
        } finally {
            // Selection may be changed by the probe; never make a claim of UI/selection rollback.
            Qt.quit()
        }
    }
}
