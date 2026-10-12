"""Execute actual QML functions with deterministic score/FileIO test objects (not MuseScore)."""
import json
from pathlib import Path
from PySide6.QtCore import QCoreApplication
from PySide6.QtQml import QJSEngine
root=Path(__file__).resolve().parents[1]
qml=(root/'AI-Notation-Studio-App.qml').read_text(encoding='utf8')
app=QCoreApplication([]); engine=QJSEngine()
def run(code):
 v=engine.evaluate(code)
 assert not v.isError(),v.toString()
 return v.toString()
def block(first,last): return qml[qml.index('    function '+first):qml.index('    function '+last)]
runtime=qml[qml.index('    function createCompactRuntime()'):qml.index('    // END COMPACTSCORE RUNTIME')]
run(runtime+'\nvar compact=createCompactRuntime();')
run('''var disk={}, tags={}, failExport=false, corrupt=false, writes=0;
var Qt={resolvedUrl:function(p){return 'file:///test/'+p;}};
function fileUrlToLocalPath(p){return p.replace('file://','');}
var compactFile={source:'',read:function(){return disk[this.source]||'';},write:function(v){disk[this.source]=v;return true;}};
var historyFile=compactFile;
var curScore={metaTag:function(k){return tags[k]||'';},setMetaTag:function(k,v){tags[k]=v;}};
function scoreMemoryTagName(){return 'memory';}
function writeScore(score,path,ext){writes++;disk[path]='<score-partwise><part-list/><part id="edited"><measure number="99"/></part></score-partwise>';return !failExport;}
var musicalDraft='stale draft',compositionJson='stale json',compactSourceText='stale cs',compositionCosts=[],compositionHistory=[],historyError='',statusText='';
function currentScoreMemoryObject(){return {compositionCosts:compositionCosts};}
''')
run(block('compositionRecordTag()', 'diagnosticText('))
run(block('writeVerifiedCompactFile(', 'restoreComposition('))
# A loaded score with no draft/internal notation still contains the actual complete live XML.
d=json.loads(run('JSON.stringify(diagnosticComposition())'))
assert '<measure number="99"' in d['musicXml']
assert d['internalNotation']['json'] is None and d['accounting']['status']=='unavailable'
assert d['accounting']['estimatedUsd'] is None
# Score metadata, not session variables, supplies the original provider call.
ledger=[{'provider':'Anthropic','model':'requested','returnedModel':'actual','tokens':{'input':1245,'output':4543,'thinking':2969},'cost':{'usd':0.04792},'rawUsage':{'input_tokens':1245,'output_tokens':4543}}]
run('tags.memory='+json.dumps(json.dumps({'compositionCosts':ledger,'compositionJson':'{}'}))+';')
d=json.loads(run('JSON.stringify(diagnosticComposition())'))
assert d['accounting']['calls']==ledger and d['accounting']['estimatedUsd']==0.04792
assert d['accounting']['exactBilledUsd'] is None
# Bind legacy provenance before pending workspace data changes; append applied revisions only.
run('pinScoreComposition();tags.memory=JSON.stringify({compositionCosts:[]});')
assert json.loads(run('JSON.stringify(diagnosticComposition())'))['accounting']['calls']==ledger
run('var compositionJob={id:"next"};compositionCosts=[];stampScoreComposition(curScore);')
assert len(json.loads(run('JSON.stringify(diagnosticComposition())'))['generationHistory'])==2
run('tags[compositionRecordTag()]="";')
# Corruption and export failure never substitute a different composition.
run('tags.memory="broken";')
d=json.loads(run('JSON.stringify(diagnosticComposition())'))
assert d['memoryError'] and d['accounting']['calls']==[]
assert run('failExport=true; try {diagnosticComposition(); "bad";} catch(e) {"blocked";}')=='blocked'
run('failExport=false; tags.memory="";')
cs=(root/'tests/fixtures/Elegie.cs').read_text(encoding='utf8')
run('tags["AI-Notation-Studio-Source-CS1"]='+json.dumps(cs)+';')
d=json.loads(run('JSON.stringify(diagnosticComposition())'))
assert json.loads(d['internalNotation']['json'])['parts']
# Verified history snapshot, reread merge, backup recovery, and no overwrite of corrupt history.
run('compositionJson="{}";compositionJob=null;var instructionBox={text:"test"};function providerName(){return "test";}var modelBox={text:"test"};archiveComposition();archiveComposition();')
assert run('compositionHistory.length')=='2'
run('disk[historyPath()]="broken";loadCompositionHistory();')
assert run('compositionHistory.length')=='1'
assert 'Sicherung' in run('historyError')
assert run('archiveComposition();disk[historyPath()]')=='broken'
assert run('compact.ai.usage("google",{usageMetadata:{promptTokenCount:1,candidatesTokenCount:2}}).thinking===null')=='true'
print('Live XML, missing notation, score-bound original ledger, unknown charges, corrupt metadata, export failure, CS1 recovery, history backup/recovery and missing thinking tokens OK (Qt JS test objects)')

# Execute the shipped score-memory functions through save, empty runtime, and reload.
run(block('currentScoreMemoryObject()', 'clearScoreMemory()'))
run('var root={version:"0.10.24"},scoreMemoryNotes="",modeBox={currentIndex:2,count:7},freeInstrumentation="piano",freeMeasures=16,instrumentBox={currentIndex:0,count:1},chatModeIndex=0,chatMessages=[],compositionIdea="",ideaReady=false,restoringMemory=false;')
run('compositionCosts='+json.dumps(ledger)+';compositionJson="{}";compactSourceText="original";saveScoreMemory(true);compositionCosts=[];compositionJson="";loadScoreMemory(true);')
assert json.loads(run('JSON.stringify(compositionCosts)'))==ledger
assert run('compositionJson')=='{}'
# A legacy score with empty workspace can recover attribution only from a unique notation match.
run('tags[compositionRecordTag()]="";tags.memory="";tags["AI-Notation-Studio-Source-CS1"]='+json.dumps(cs)+';disk[historyPath()]=JSON.stringify({entries:[{score:{compactSourceText:'+json.dumps(cs)+',compositionCosts:'+json.dumps(ledger)+'}}]});')
assert json.loads(run('JSON.stringify(diagnosticComposition())'))['accounting']['calls']==ledger
run('disk[historyPath()]=JSON.stringify({entries:[{score:{compactSourceText:'+json.dumps(cs)+',compositionCosts:'+json.dumps(ledger)+'}},{score:{compactSourceText:'+json.dumps(cs)+',compositionCosts:'+json.dumps(ledger)+'}}]});')
assert json.loads(run('JSON.stringify(diagnosticComposition())'))['accounting']['calls']==[]
print('Actual metadata save/reload retains original costs; unique history recovery and ambiguous attribution refusal OK')

# Real diagnostic mismatch: live title Mit zarter Sehnsucht, pending result Hans im Glück.
run('disk[historyPath()]="";tags[compositionRecordTag()]="";tags["AI-Notation-Studio-Source-CS1"]="";curScore.title="Mit zarter Sehnsucht";tags.memory=JSON.stringify({compositionJson:JSON.stringify({score:{title:"Hans im Glück"}}),compositionCosts:'+json.dumps(ledger)+'});')
d=json.loads(run('JSON.stringify(diagnosticComposition())'))
assert d['musicXml'] and d['accounting']['calls']==[] and d['memoryError']
run('pinScoreComposition();')
assert run('tags[compositionRecordTag()]||""')==''
# Even equal titles cannot override a conflicting original CS1 tag.
run('curScore.title="Hans im Glück";tags["AI-Notation-Studio-Source-CS1"]='+json.dumps(cs)+';tags.memory=JSON.stringify({compactSourceText:"other score",compositionCosts:'+json.dumps(ledger)+'});')
d=json.loads(run('JSON.stringify(diagnosticComposition())'))
assert d['internalNotation']['cs1']==cs and d['accounting']['calls']==[] and d['memoryError']
print('Pending result with another title/CS1 never receives live-score accounting attribution')
