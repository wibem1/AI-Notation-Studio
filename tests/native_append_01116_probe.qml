// Native MuseScore smoke test of append with 3 separate 1-staff parts.
import QtQuick 2.2
import MuseScore 3.0
import FileIO 3.0
MuseScore {
 id: root
 menuPath: "Plugins.AI Notation Studio Tests.Append 01116"
 version: "0.0.1-test"
 description: "Synthetic continuation and original integrity"
 requiresScore: true
 property string transcript: ""
 FileIO { id: requestFile; source: "/tmp/ans-01116-append-request.json" }
 FileIO { id: output; source: "/tmp/ans-01116-result.txt" }
 function log(v) { transcript+=v+"\n"; output.write(transcript);console.log(v) }
 function save(score,label) {
   if(!writeScore(score,"/tmp/ans-01116-"+label+".musicxml","musicxml"))throw Error("Export: "+label)
 }
 function find(item,name) {
   if(item.objectName===name)return item
   var a=item.children||[]
   for(var i=0;i<a.length;i++){var r=find(a[i],name);if(r)return r}
   return null
 }
 onRun: {
  var original=curScore,app=null
  try{
    if(!original||original.nstaves!==3 ||
       String(original.metaTag("workTitle")).indexOf("ANS-TEST-Replace-01114")!==0)
       throw Error("Not the isolated 3-part fixture")
    if(original.nmeasures===30){
      output.source="/tmp/ans-01116-imported-result.txt"
      save(original,"imported")
      log("ANS_01116_IMPORTED PASS: new MuseScore score has 30 bars, 3 staves")
      Qt.quit();return
    }
    if(original.nmeasures!==28)throw Error("Expected original 28-bar fixture")
    save(original,"before")
    var component=Qt.createComponent("AI-Notation-Studio-App.qml")
    if(component.status!==Component.Ready)throw Error(component.errorString())
    app=component.createObject(root)
    if(!app||String(app.version)!=="0.11.16")throw Error("Wrong staged version")
    var source=app.workflowXml(),request=JSON.parse(requestFile.read())
    var job={id:"append-test",mode:3,modeName:"Fortsetzen",sourcePath:"stored",
      sourceXml:source,sourceGuard:app.workflowGuard(source),sourceTime:"4/4",
      workflowKind:"append",workflowState:"draft",measures:2,startMeasure:29,
      startQuarter:112,endQuarter:112,instruments:["violin","piano","piano"],
      first:{provider:"Google",model:"offline"},second:{provider:"Google",model:"offline"},
      strategy:0,selection:"",preferences:"",instruction:"Setze für 2 Takte fort"}
    app.compositionJob=job
    app.finishComposition(job,request.raw)
    if(app.compositionJob.workflowState!=="ready")
      throw Error("Continuation failed: "+app.statusText+" "+app.compositionJob.validation_error)
    if(app.compactWarnings.join(" ").indexOf("unbenutztes zweites Klaviersystem")<0)
      throw Error("Expected piano-system correction warning")
    // Linux exercises the identical non-Windows FileIO fallback used on Mac.
    app.exportDiagnostic()
    if(!app.lastDiagnosticPath || app.statusText.indexOf("Diagnose gespeichert")<0)
      throw Error("Non-Windows diagnostic save failed: "+app.statusText)
    var savedPath=requestFile.source
    requestFile.source=app.lastDiagnosticPath
    var exported=JSON.parse(requestFile.read())
    requestFile.source=savedPath
    if(exported.pluginVersion!=="0.11.16-dev" || exported.diagnosticSchema!==2)
      throw Error("Saved diagnostic JSON content invalid")
    var choice=find(app,"outputTargetSelector")
    if(!choice)throw Error("Output selector missing")
    choice.currentIndex=1;choice.activated(1)
    var receipt=app.applySelectedCompactResult()
    if(!receipt||!receipt.path)throw Error("New-score handoff failed: "+app.statusText)
    if(!receipt.handedOff&&receipt.score&&!original.is(receipt.score))save(receipt.score,"imported")
    if(original.nmeasures!==28||original.nstaves!==3)throw Error("Original changed")
    save(original,"after")
    log("ANS_01116 PASS: native 28→30 continuation + non-Windows JSON save, source unchanged, offline")
  }catch(e){log("ANS_01116 FAIL: "+String(e))}
  finally{if(app)app.destroy();Qt.quit()}
 }
}
