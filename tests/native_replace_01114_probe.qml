// Native MuseScore 4.7.6 smoke test; entirely synthetic score and locally saved CS1.
import QtQuick 2.2
import MuseScore 3.0
import FileIO 3.0
MuseScore {
    id: root
    menuPath: "Plugins.AI Notation Studio Tests.Replace 01114"
    description: "Disposable synthetic replacement, stored reply retry and safe output"
    version: "0.0.1-test"
    requiresScore: true
    property string transcript: ""
    FileIO { id: requestFile; source: "/tmp/ans-01114-request.json" }
    FileIO { id: resultFile; source: "/tmp/ans-01114-result.txt" }
    function log(msg) { transcript+=msg+"\n"; resultFile.write(transcript); console.log(msg) }
    function find(item, name) {
        if(item.objectName===name) return item
        var children=item.children||[]
        for(var i=0;i<children.length;i++) { var found=find(children[i],name); if(found)return found }
        return null
    }
    function save(score, name) {
        if(!writeScore(score,"/tmp/ans-01114-"+name+".musicxml","musicxml"))
            throw Error("Could not export "+name)
    }
    onRun: {
        var original=curScore,app=null
        try {
            if(!original || String(original.metaTag("workTitle")).indexOf("ANS-TEST-Replace-01114")!==0)
                throw Error("Not the synthetic 0.11.14 fixture")
            if(original.nmeasures!==28 || original.nstaves!==3)
                throw Error("Unexpected native fixture: "+original.nmeasures+" bars / "+original.nstaves+" staves")
            // The original and replacement have the same title/bar count:
            // distinguish them by the actual first violin note, not metadata.
            var cursor=original.newCursor()
            cursor.staffIdx=0
            cursor.voice=0
            cursor.rewind(0)
            var first=cursor.element
            var firstPitch=first&&first.notes&&first.notes.length ? Number(first.notes[0].pitch) : -1
            // A4=69 in the base score; G5=79 in the replacement.
            if(firstPitch===79) {
                resultFile.source="/tmp/ans-01114-imported-result.txt"
                save(original,"imported")
                log("ANS_01114_IMPORTED PASS: imported child-window score has 28 bars and 3 staves")
                Qt.quit(); return
            }
            if(firstPitch!==69)throw Error("Unexpected source violin pitch: "+firstPitch)
            save(original,"before")
            var sourceTag=String(original.metaTag("AI-Notation-Studio-Source-CS1")||"")
            var component=Qt.createComponent("AI-Notation-Studio-App.qml")
            if(component.status!==Component.Ready) throw Error("App component: "+component.errorString())
            app=component.createObject(root)
            if(!app || String(app.version)!=="0.11.14-dev")
                throw Error("Staging 0.11.14-dev did not load")
            var request=JSON.parse(requestFile.read())
            var source=app.workflowXml()
            var job={id:"native-replace-test",mode:5,modeName:"Überarbeitung aus Analyse",
                sourcePath:"stored",sourceXml:source,sourceGuard:app.workflowGuard(source),
                workflowState:"draft",workflowKind:"replace",sourceTime:"4/4",
                measures:28,startMeasure:1,startQuarter:0,endQuarter:112,
                instruments:["violin","piano","piano"],
                first:{provider:"Google",model:"offline-fixture"},
                second:{provider:"Google",model:"offline-fixture"},
                analysis:"Offline test",strategy:0}
            app.compositionJob=job
            app.finishComposition(job,request.raw)
            if(!app.compositionJob || app.compositionJob.workflowState!=="ready")
                throw Error("Generated score rejected: "+app.statusText+" "+(app.compositionJob&&app.compositionJob.validation_error))
            if(!app.compactWarnings.join(" ").includes("Takt 12"))
                throw Error("Targeted LH bar 12 correction was not reported")
            if(app.compact.score.inspect(JSON.parse(app.compositionJson)).length)
                throw Error("Result still has rhythm errors")
            if(!app.compositionJob.raw_response || app.compositionJob.raw_response!==request.raw)
                throw Error("Saved raw response was lost")
            var selector=find(app,"outputTargetSelector")
            if(!selector)throw Error("Missing output selector")
            selector.currentIndex=1
            selector.activated(1)
            var receipt=app.applySelectedCompactResult()
            if(!receipt || !receipt.path)
                throw Error("New score handoff failed: "+app.statusText)
            if(!receipt.handedOff && receipt.score && !original.is(receipt.score))
                save(receipt.score,"imported")
            if(original.nmeasures!==28 || original.nstaves!==3)throw Error("Original changed")
            if(String(original.metaTag("AI-Notation-Studio-Source-CS1")||"")!==sourceTag)
                throw Error("Original stamped with imported score metadata")
            save(original,"after")
            log("ANS_01114 PASS: real GUI decode, 28-bar correction, source untouched, explicit new-score handoff; no API call")
        }catch(error){log("ANS_01114 FAIL: "+String(error))}
        finally{if(app)app.destroy();Qt.quit()}
    }
}
