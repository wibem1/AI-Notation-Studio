// Real MuseScore integration of the actual single-file preview application.
import QtQuick 2.2
import MuseScore 3.0
import FileIO 3.0
MuseScore {
    id: root
    menuPath: "Plugins.AI Notation Studio Tests.Native output preview probe"
    description: "Disposable fixture: test actual preview output controls and undo"
    version: "0.0.1-spike"
    requiresScore: true
    property string transcript: ""
    FileIO { id: input; source: "/tmp/ans-prelude-data.json" }
    FileIO { id: output; source: "/tmp/ans-preview-result.txt" }
    function log(text) { transcript += text+'\n'; output.write(transcript); console.log(text) }
    function save(score, stage) {
        if (!writeScore(score,'/tmp/ans-poly-'+stage+'.musicxml','musicxml')) throw Error('Export '+stage+' failed')
    }
    function find(item, name) {
        if (item.objectName === name) return item
        var all=item.children || []
        for (var i=0;i<all.length;i++) { var result=find(all[i],name); if (result) return result }
        return null
    }
    onRun: {
        var live=curScore, app=null, changed=false
        try {
            if (!live || String(live.metaTag('workTitle')).indexOf('ANS-TEST-')!==0 || live.nmeasures!==4 || live.nstaves!==3)
                throw Error('Only disposable complex fixture permitted')
            var component=Qt.createComponent('AI-Notation-Studio-App-0.11.12.qml')
            if (component.status!==Component.Ready) throw Error(component.errorString())
            app=component.createObject(root)
            if (!app || app.version!=='0.11.12') throw Error('Actual preview did not load')
            log('ANS_PREVIEW actual single-file app loaded')
            var request=JSON.parse(input.read())
            var source=app.workflowXml()
            var job={id:'native-output-preview',mode:9,sourcePath:'stored',sourceXml:source,
                     sourceGuard:app.workflowGuard(source),workflowState:'ready',workflowKind:'prependPrelude',
                     measures:2,preludeTargets:[{indices:[1],splitPiano:false}],instruments:['piano'],
                     startQuarter:0,endQuarter:0}
            app.compositionJson=JSON.stringify(request.data)
            app.compositionJob=job
            var selector=find(app,'outputTargetSelector'), button=find(app,'applyCompactResultButton')
            if (!selector || !button || selector.currentIndex!==0) throw Error('Output controls/default missing')
            save(live,'before')
            // The real button handler, real workflow guard, real mapping and writer.
            button.clicked()
            if (live.nmeasures!==6) throw Error('Actual preview apply failed: '+app.statusText)
            changed=true
            if (!live.is(curScore)) throw Error('Existing target opened another document')
            save(live,'committed')
            cmd('action://notation/undo')
            changed=false
            if (live.nmeasures!==4) throw Error('One undo did not restore original')
            save(live,'undo')
            // Rejection through the SAME button must not open a replacement score.
            var bad=JSON.parse(JSON.stringify(request.data))
            bad.parts[0].markings=[{type:'pedal',start:{measure:1,beat:1},end:{measure:2,beat:4}}]
            app.compositionJson=JSON.stringify(bad)
            job.workflowState='ready';app.compositionJob=job
            button.clicked()
            if (live.nmeasures!==4 || !live.is(curScore) || app.statusText.indexOf('Keine sichere direkte Übernahme')<0)
                throw Error('Unsupported content did not abort safely: '+app.statusText)
            save(live,'rollback') // unchanged rejection snapshot for external comparator
            log('ANS_PREVIEW PASS: actual UI button, source guard, same-score writer, undo and safe unsupported-pedal rejection')
        } catch (error) {
            log('ANS_PREVIEW FAIL: '+String(error))
            if (changed) { try { cmd('action://notation/undo') } catch (undoError) { log('UNDO_ERROR '+undoError) } }
        } finally { if(app)app.destroy();Qt.quit() }
    }
}
