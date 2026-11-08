// Synthetic-only GUI safety test for analysis instruction entered in compose mode.
import QtQuick 2.2
import MuseScore 3.0
import FileIO 3.0
MuseScore {
 id: root
 menuPath: "Plugins.AI Notation Studio Tests.Analysis intent guard"
 description: "Check analysis/compose mismatch without network or API keys"
 version: "0.0.1-test"
 requiresScore: true
 property string transcript: ""
 FileIO { id: output; source: "/tmp/ans-01115-result.txt" }
 function log(s) { transcript+=s+"\n";output.write(transcript);console.log(s) }
 function find(item,name) {
  if(item.objectName===name)return item
  var kids=item.children||[]
  for(var i=0;i<kids.length;i++){var f=find(kids[i],name);if(f)return f}
  return null
 }
 onRun: {
  var app=null
  try {
   if(!curScore||curScore.nmeasures!==28||curScore.nstaves!==3||
      String(curScore.metaTag("workTitle")).indexOf("ANS-TEST-Replace-01114")!==0)
     throw Error("This test only works on its synthetic 28-bar fixture")
   var component=Qt.createComponent("AI-Notation-Studio-App.qml")
   if(component.status!==Component.Ready)throw Error("Component failed: "+component.errorString())
   app=component.createObject(root)
   if(!app||String(app.version)!=="0.11.15")throw Error("Wrong app version")
   var mode=find(app,"compositionModeSelector"),instruction=find(app,"compositionInstructionBox")
   if(!mode||!instruction)throw Error("Missing live mode or instruction controls")
   instruction.text="Analysiere die Komposititon"
   mode.currentIndex=3
   app.sendToAI()
   if(app.busy||app.compositionJob||app.compositionCosts.length!==0||
      app.statusText.indexOf("Modus widersprechen")<0||
      app.statusText.indexOf("Kein KI-Aufruf")<0)
     throw Error("Wrong-mode analysis request was not stopped: "+app.statusText)
   mode.currentIndex=2
   app.sendToAI()
   if(app.busy||app.compositionJob||app.compositionCosts.length!==0||
      app.statusText.indexOf("Kein KI-Aufruf")<0)
     throw Error("Second composing mode bypassed guard")
   log("ANS_01115 PASS: native MuseScore UI blocks analysis text in generating modes without provider request")
  }catch(e){log("ANS_01115 FAIL: "+String(e))}
  finally{if(app)app.destroy();Qt.quit()}
 }
}
