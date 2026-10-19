"""Native MusicXML boundary/replacement and actual workflow glue, simulated providers."""
import runpy,json
from pathlib import Path
from lxml import etree
h=runpy.run_path(str(Path(__file__).with_name('test_workflows.py')))
run,fn,schema=h['run'],h['function'],h['schema']
# Self-contained four-quarter measures, no implicit spans.
run('''function xmlFor(count,pitch) {
 var out='<score-partwise version="4.0"><work><work-title>Test</work-title></work><part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list><part id="P1">';
 for(var i=0;i<count;i++)out+='<measure number="'+(i+1)+'">'+(i===0?'<attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>':'')+'<note><pitch><step>'+pitch+'</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>';
 return out+'</part></score-partwise>';
}
var original=xmlFor(8,'C'),replacement=xmlFor(4,'D');
''')
for kind,start,end,total in [('replaceTail',24,32,10),('replace',8,24,8)]:
 data=json.loads(run('JSON.stringify(compact.context.combine(original,replacement,'+json.dumps(dict(kind=kind,startQuarter=start,endQuarter=end))+'))'))
 d=etree.fromstring(data['xml'].encode());schema.assertValid(d)
 ms=d.findall('part/measure');assert len(ms)==total
 assert all(m.findtext('note/pitch/step')=='C' for m in ms[:int(start/4)])
 assert all(m.findtext('note/pitch/step')=='D' for m in ms[int(start/4):int(start/4)+4])
 if kind=='replace':assert all(m.findtext('note/pitch/step')=='C' for m in ms[6:])
print('PASS native XML replacement: exact measure count, prefix/suffix notes, MusicXML 4 schema')
run('var crossing=original.replace("<measure number=\\\"6\\\">","<measure number=\\\"6\\\"><direction><direction-type><wedge type=\\\"crescendo\\\" number=\\\"1\\\"/></direction-type></direction>").replace("<measure number=\\\"8\\\">","<measure number=\\\"8\\\"><direction><direction-type><wedge type=\\\"stop\\\" number=\\\"1\\\"/></direction-type></direction>");')
assert run('try{compact.context.checkBoundaries(crossing,24,32);"BAD"}catch(e){"BLOCKED"}')=='BLOCKED'
assert run('try{compact.context.combine(original,replacement,{kind:"replace",startQuarter:1,endQuarter:8});"BAD"}catch(e){"BLOCKED"}')=='BLOCKED'
for name in ['workflowXml','workflowApplyCheck','archiveWorkflowAnalysis','reviseFromAnalysis']:run(fn(name))
run('function saveCurrentKey(){}function saveCurrentModel(){};curScore.parts=[{instrumentId:"piano"}];xml=original;')
run('compositionJob={sourcePath:"stored",sourceXml:original,sourceGuard:workflowGuard(original),workflowState:"ready"};workflowApplyCheck(compositionJob);')
run('xml=replacement;')
assert run('try{workflowApplyCheck(compositionJob);"BAD"}catch(e){"BLOCKED"}')=='BLOCKED'
run('xml=original;compositionJob.workflowState="applied";')
assert run('try{workflowApplyCheck(compositionJob);"BAD"}catch(e){"BLOCKED"}')=='BLOCKED'
# Tail option counts replacements in addition to new measures and captures immutable source.
run('contextMeasures=function(){return freeMeasures};selectionBounds=function(){return {startTick:0,endTick:15360}};scoreEndTick=function(){return 15360};freeMeasures=4;workflowTransitionBars=2;compositionJob=prepareCompositionJob(3);')
assert run('compositionJob.measures')=='6' and run('compositionJob.newMeasures')=='4'
assert run('compositionJob.startQuarter')=='24' and run('compositionJob.workflowKind')=='replaceTail'
# Analysis is restorable without provider calls; review uses currently selected model.
run('currentScoreMemoryObject=function(){return {compositionJson:compositionJson,compositionCosts:compositionCosts,compositionJob:compositionJob}};compositionJson="";compositionJob=null;workflowTransitionBars=0;requests=[];queue=[];archiveWorkflowAnalysis("E5 $\\\\rightarrow$ D5",original,{startTick:0,endTick:15360});')
assert run('requests.length')=='0' and run('workflowAnalysis.answer')=='E5 → D5'
run('instructionBox.text="Verbessere die Phrasierung";busy=false;reviseFromAnalysis();')
assert run('requests.length')=='1' and run('compositionJob.analysis.indexOf("E5")>=0')=='true'
assert run('compositionJob.workflowKind')=='replace'
# Invalid raw replies are retained for inspection without an applyable composition.
run('finishComposition(compositionJob,"INVALID SOURCE");')
assert run('compositionJob.workflowState')=='invalid'
assert run('compositionHistory[0].score.compositionJob.raw_response')=='INVALID SOURCE'
print('PASS workflow glue: original conflict, applied lock, transition count, analysis archive, review, invalid raw response preserved')
