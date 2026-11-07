// Isolated native writer integration on a DISPOSABLE fixture only.
import QtQuick 2.2
import MuseScore 3.0
import FileIO 3.0
import "native-prelude-writer.js" as NativePrelude

MuseScore {
    id: root
    menuPath: "Plugins.AI Notation Studio Tests.Native polyphonic probe"
    description: "Disposable fixture: write two CS1 piano bars, then one-step undo"
    version: "0.0.1-spike"
    requiresScore: true
    property string transcript: ""
    FileIO { id: input; source: "/tmp/ans-prelude-data.json" }
    FileIO { id: output; source: "/tmp/ans-poly-result.txt" }
    function log(text) { transcript += text + "\n"; output.write(transcript); console.log(text) }
    function save(score, stage) {
        if (!writeScore(score, "/tmp/ans-poly-"+stage+".musicxml", "musicxml")) throw Error('Export failed: '+stage)
    }
    onRun: {
        var committed = false
        var score = curScore
        try {
            if (!score || String(score.metaTag('workTitle')).indexOf('ANS-TEST-') !== 0 || score.nmeasures !== 4 || score.nstaves !== 3)
                throw Error('Only disposable complex ANS-TEST fixture permitted')
            var request = JSON.parse(input.read())
            var writer = NativePrelude.createNativePreludeWriter()
            var plan = writer.prepare(score, request.data, request.mapping)
            log('ANS_POLY_PROBE prepared '+plan.events.length+' events, '+plan.measures+' bars')
            save(score, 'before')
            // Fail after the first voice already contains notes, chords and rests.
            // The writer must roll back BOTH inserted bars and all partial music.
            var calls = 0
            var injected = false
            try {
                writer.apply(score, plan, {
                    fractionFromTicks:function(tick) {
                        calls++
                        if (calls === 15) throw Error('ANS_EXPECTED_PARTIAL_WRITE_FAILURE')
                        return root.fractionFromTicks(tick)
                    },
                    cmd:function(action) { root.cmd(action) }
                })
            } catch (expectedError) {
                if (String(expectedError).indexOf('ANS_EXPECTED_PARTIAL_WRITE_FAILURE') < 0) throw expectedError
                injected = true
            }
            if (!injected || calls !== 15 || score.nmeasures !== 4 || score.nstaves !== 3)
                throw Error('Partial-write rollback failed')
            save(score, 'rollback')
            log('ANS_POLY_PROBE partial-write rollback completed; XML check required')
            writer.apply(score, plan, {
                fractionFromTicks:function(tick) { return root.fractionFromTicks(tick) },
                cmd:function(action) {
                    log('ANS_POLY_PROBE calling '+action+' at '+score.nmeasures+' bars')
                    root.cmd(action)
                    log('ANS_POLY_PROBE returned '+action+' at '+score.nmeasures+' bars')
                }
            })
            committed = true
            save(score, 'committed')
            cmd('action://notation/undo')
            committed = false
            save(score, 'undo')
            if (score.nmeasures !== 4 || score.nstaves !== 3) throw Error('One undo did not restore fixture')
            log('ANS_POLY_PROBE PASS: native writer and one undo; independent XML check required')
        } catch (error) {
            log('ANS_POLY_PROBE FAIL: '+String(error))
            if (committed) { try { cmd('action://notation/undo') } catch (undoError) { log('UNDO_ERROR '+undoError) } }
        } finally { Qt.quit() }
    }
}
