// Synthetic, disposable score only: test the real paid-answer recovery route.
import QtQuick 2.2
import MuseScore 3.0
import FileIO 3.0
MuseScore {
    id: root
    menuPath: "Plugins.AI Notation Studio Tests.Prelude recovery probe"
    description: "Disposable fixture: saved response retry and explicit new-score output"
    version: "0.0.1-test"
    requiresScore: true
    property string transcript: ""
    FileIO { id: input; source: "/tmp/prelude-recovery-request.json" }
    FileIO { id: output; source: "/tmp/ans-recovery-result.txt" }
    function log(s) { transcript+=s+'\n';output.write(transcript);console.log(s) }
    function find(item,name) {
        if(item.objectName===name)return item
        var list=item.children||[]
        for(var i=0;i<list.length;i++){var child=find(list[i],name);if(child)return child}
        return null
    }
    function save(score,stage) { if(!writeScore(score,'/tmp/recovery-'+stage+'.musicxml','musicxml'))throw Error('Export failed: '+stage) }
    onRun: {
        var original=curScore, app=null
        try {
            if(!original||String(original.metaTag('workTitle')).indexOf('ANS-TEST-')!==0||original.nmeasures!==32||original.nstaves!==4)
                throw Error('Only the synthetic disposable 32-measure/4-staff fixture is permitted')
            var component=Qt.createComponent('AI-Notation-Studio-App-0.11.13.qml')
            if(component.status!==Component.Ready)throw Error(component.errorString())
            app=component.createObject(root)
            if(!app||app.version!=='0.11.13')throw Error('Recovery app did not load')
            var request=JSON.parse(input.read()),source=app.workflowXml()
            var job={id:'recovery-test',mode:9,modeName:'Vorspiel voranstellen',sourcePath:'stored',sourceXml:source,sourceGuard:app.workflowGuard(source),
                     workflowState:'draft',workflowKind:'prependPrelude',sourceTime:'4/4',measures:2,
                     preludeTargets:[{indices:[1],splitPiano:false},{indices:[2],splitPiano:false}],instruments:['piano','piano'],strategy:0,
                     first:{provider:'Google',model:'no-network-test'},second:{provider:'Google',model:'no-network-test'},startQuarter:0,endQuarter:0}
            app.compositionJob=job
            var error=find(app,'compositionValidationError'),retry=find(app,'retryStoredCompositionButton')
            if(!error||!retry)throw Error('Recovery controls missing')
            app.finishComposition(job,request.bad)
            if(app.compositionJob.workflowState!=='invalid'||!error.visible||!retry.visible)throw Error('Error/retry not visible after rejection')
            var saved=app.compositionJob
            saved.raw_response=request.correct
            app.refreshCompositionJob(saved)
            retry.clicked()
            if(app.compositionJob.workflowState!=='ready'||error.visible||retry.visible)throw Error('Cost-free recovery failed: '+app.statusText)
            save(original,'before')
            var choice=find(app,'outputTargetSelector'),button=find(app,'applyCompactResultButton')
            if(!choice||!button)throw Error('Apply controls missing')
            choice.currentIndex=1;choice.activated(1) // explicit request, never a silent fallback
            // Same apply function used by the button. MuseScore 4.7.6 opens a
            // separate window; this plugin's curScore correctly stays original.
            var imported=app.applySelectedCompactResult()
            if(!imported||original.is(imported)||imported.nmeasures!==34)throw Error('Explicit new-window output failed: '+app.statusText)
            save(imported,'new')
            if(original.nmeasures!==32)throw Error('Original was altered')
            save(original,'original-after')
            log('ANS_RECOVERY PASS: actual invalid→retry→ready UI, explicit new-window apply route, 32→34; no provider request')
        }catch(error){log('ANS_RECOVERY FAIL: '+String(error))}
        finally{if(app)app.destroy();Qt.quit()}
    }
}
