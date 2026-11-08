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
    if(!app||!/^0\.11\.(?:16|17(?:-dev)?|18(?:-dev)?|19(?:-dev)?|20(?:-dev)?|21(?:-dev)?)$/.test(String(app.version)))throw Error("Unexpected staged app version: "+String(app&&app.version))
    if(String(app.version)==="0.11.20" || String(app.version)==="0.11.21") {
      // Exercise the new entry point in real MuseScore with no range selection.
      // Invalid selections must not trigger a paid model request or change music.
      if(original.selection && original.selection.isRange)
        throw Error("Notation negative fixture unexpectedly has a range selection")
      app.notationImprove()
      if(String(app.statusText).indexOf("Kein KI-Aufruf")<0 || app.busy ||
         app.notationChanges.length!==0 || app.structureSnapshot!==null)
        throw Error("Unsafe notation-improve preflight: "+app.statusText)
      save(original,"notation-preflight")
      log("ANS_01120_NOTATION_PREFLIGHT PASS: invalid selection blocked, no AI call")
      // Positive native selection test: deterministic stage must analyze a real
      // one-instrument range without launching a provider or mutating the score.
      original.selection.selectRange(0,1920,0,1)
      if(!original.selection.isRange)throw Error("Cannot select native notation range")
      var captured=app.notationCapture()
      if(!captured || !captured.notes || captured.notes.length===0)
        throw Error("Selected range contains no captured notes")
      app.notationStructurePrepare()
      if(String(app.structureStatus).indexOf("Strukturprüfung:")!==0 || app.busy)
        throw Error("Notation structure analysis failed: "+app.structureStatus)
      save(original,"notation-selection")
      log("ANS_01120_NOTATION_STRUCTURE PASS: selected range analyzed without AI")
      original.selection.clear()
    }
    if(String(app.version)==="0.11.21") {
      // Inject a redundant treble clef into the second violin measure. Verify
      // that the *actual production repair engine* removes it, without any
      // changed sounding note or original score modification.
      var xml=app.notationStructureExport()
      var needle=/<measure number=["']2["'][^>]*>/
      if(!needle.test(xml))throw Error("No second measure in MuseScore fixture")
      var altered=xml.replace(needle, function(m){return m+
        '<attributes><clef><sign>G</sign><line>2</line></clef></attributes>'})
      if(altered===xml)throw Error("Failed to create redundant clef fixture")
      var change=app.notationStructure.repairRedundantClefs(altered,
        {partIndex:0,staffs:[1],startQuarter:4,endQuarter:8})
      if(change.changed!==1 ||
        app.notationStructure.signature(altered)!==app.notationStructure.signature(change.xml))
        throw Error("Native clef repair failed or changed musical signature: "+change.report)
      log("ANS_01121_CLEF_REPAIR PASS: redundant G clef removed; music unchanged")
      // Standard 4/4 fixture with eight separate eighth notes and no beams.
      // The production engine must add exactly four two-note groups, never
      // changing the sounding pitches, onsets, durations or voices.
      var halfNotes=['C','D','E','F','G','A','B','C'],noteXml=''
      for(var bi=0;bi<halfNotes.length;bi++) noteXml+=
        '<note><pitch><step>'+halfNotes[bi]+'</step><octave>4</octave></pitch>'+ 
        '<duration>1</duration><type>eighth</type></note>'
      var beamsXml='<score-partwise><part id="P1"><measure number="1">'+
        '<attributes><divisions>2</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>'+noteXml+
        '</measure></part></score-partwise>'
      var beamResult=app.notationStructure.repairSafeVisual(beamsXml,
        {partIndex:0,staffs:[1],startQuarter:0,endQuarter:4})
      if(beamResult.changed!==4 ||
        (beamResult.xml.match(/<beam number="1">/g)||[]).length!==8 ||
        app.notationStructure.signature(beamResult.xml)!==app.notationStructure.signature(beamsXml))
        throw Error('Native rhythmic repair failed: '+beamResult.report)
      log("ANS_01121_BEAM_REPAIR PASS: four eighth-note groups repaired; music unchanged")
    }
    var source=app.workflowXml(),request=JSON.parse(requestFile.read())
    var job={id:"append-test",mode:3,modeName:"Fortsetzen",sourcePath:"stored",
      sourceXml:source,sourceGuard:app.workflowGuard(source),sourceTime:"4/4",
      workflowKind:"append",workflowState:"draft",measures:2,startMeasure:29,
      startQuarter:112,endQuarter:112,instruments:["violin","piano","piano"],
      first:{provider:"Google",model:"offline"},second:{provider:"Google",model:"offline"},
      strategy:0,selection:"",preferences:"",instruction:"Setze für 2 Takte fort",
      sourceKey:{fifths:0,mode:"minor"},sourceTempo:132}
    app.compositionJob=job
    if(/^0\.11\.(?:19|20|21)(?:-dev)?$/.test(String(app.version))){
      // Native verification of the actual workflow: last 3 bars replaced,
      // then 1 new bar appended, with violin + split piano parts.
      var tail={id:"tail-native",mode:3,modeName:"Fortsetzen",sourcePath:"stored",
        sourceXml:source,sourceGuard:job.sourceGuard,sourceTime:"4/4",
        workflowKind:"replaceTail",workflowState:"draft",measures:4,
        startMeasure:26,startQuarter:100,endQuarter:112,
        newMeasures:1,transitionBars:3,
        instruments:["violin","piano","piano"],
        instruction:"Setze die Komposition fort",sourceKey:{fifths:0,mode:"minor"},sourceTempo:132}
      var tailRaw=['CS1','S {"t":"Continuation","k":"a minor","m":"4/4","b":{"v":132}}',
        'P {"i":"violin","n":"violin"}','1/1 G5:w','2/1 A5:w','3/1 B5:w','4/1 A5:w',
        'P {"i":"piano","n":"piano"}','1/1 C5:w','2/1 D5:w','3/1 E5:w','4/1 C5:w',
        'P {"i":"piano_2","n":"piano"}','1/1 A2:w','2/1 E2:w','3/1 A2:w','4/1 A2:w'].join("\n")
      app.compositionJob=tail
      app.finishComposition(tail,tailRaw)
      if(app.compositionJob.workflowState!=="ready")
        throw Error("replaceTail continuation failed: "+app.compositionJob.validation_error)
      if(app.compactWarnings.join(" ").indexOf("unbenutztes zweites Klaviersystem")<0)
        throw Error("replaceTail split-piano alignment was not used")
      job.workflowState="draft"
      app.compositionJob=job
    }
    if(/^0\.11\.(?:17(?:-dev)?|18-dev)$/.test(String(app.version))){
      // Native negative case: same 2-bar score but unrelated output key.
      var wrong=request.raw.replace('"k":"a minor"','"k":"G major"')
      if(wrong===request.raw)throw Error("Failed to construct wrong-key counterexample")
      app.finishComposition(job,wrong)
      if(app.compositionJob.workflowState!=="invalid" ||
         String(app.compositionJob.validation_error).indexOf("Grundtonart")<0)
        throw Error("Wrong-key continuation was not rejected")
      job.workflowState="draft";job.validation_error=""
      app.compositionJob=job
    }
    if(/^0\.11\.18(?:-dev)?$/.test(String(app.version))){
      // Gemini can omit spaces between legal note events. Repair must preserve
      // the music and allow a complete append without another provider call.
      var glued=request.raw.replace("1/1 G5:w","1/1 G5:hG5:h")
      if(glued===request.raw)throw Error("Missing fixture token for glued-note test")
      app.finishComposition(job,glued)
      if(app.compositionJob.workflowState!=="ready")
        throw Error("Glued-note continuation was not recovered: "+app.compositionJob.validation_error)
      job.workflowState="draft";job.validation_error=""
      app.compositionJob=job
    }
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
    if(exported.pluginVersion!==String(app.version) || exported.diagnosticSchema!==2)
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
