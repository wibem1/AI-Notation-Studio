'use strict';
const fs=require('fs'),assert=require('assert');
const Q=fs.readFileSync('AI-Notation-Studio-App-0.11.10.qml','utf8');
const block=Q.slice(Q.indexOf('    function createCompactRuntime() {'),Q.indexOf('    // END COMPACTSCORE RUNTIME'));
const runtime=Function(block+';return createCompactRuntime()')();
const method=Q.slice(Q.indexOf('    function repairPreludeTripletOverrun(data) {'),Q.indexOf('    function finishComposition(job, text) {'));
const repair=Function(method+';return repairPreludeTripletOverrun')();
function def(i,name,sound,hidden) {
 return '<score-part id="P'+i+'"><part-name'+(hidden?' print-object="no"':'')+'>'+name+'</part-name><score-instrument><instrument-sound>'+sound+'</instrument-sound></score-instrument></score-part>';
}
const names=['Flöte','Violine','Klavier','Klavier, Klavier LH'];
const header='<score-partwise version="4.0"><part-list>'+names.map((n,i)=>def(i+1,n,i<2?'other':'keyboard.piano',i>=2)).join('')+'</part-list>';
const base=header+names.map((n,i)=>'<part id="P'+(i+1)+'">'+Array.from({length:32},(_,j)=>'<measure number="'+(j+1)+'">'+
 (j===0?'<attributes><divisions>4</divisions><key><fifths>1</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time>'+(i>=2?'<staves>2</staves>':'')+'</attributes>':'')+
 '<note><pitch><step>G</step><octave>4</octave></pitch><duration>16</duration><voice>1</voice><staff>1</staff></note></measure>').join('')+'</part>').join('')+'</score-partwise>';
const targets=runtime.context.preludeCatalog(base);
assert.deepStrictEqual(targets.map(x=>x.indices),[[0],[1],[2],[3]]);
assert.strictEqual(targets[3].name,'Klavier, Klavier LH');
const answer='CS1\nS {"t":"Prelude","k":"g major","m":"4/4","b":{"v":96}}\n'+
 'P {"i":"piano-rh","n":"piano"}\n'+
 '1/1 D5:e G5:e B5:e D6:e C6:q B5:e A5:e\n'+
 '1/2 R:e [G4,B4]:e R:e [G4,B4]:e R:e [F#4,A4]:e R:e [F#4,C5]:e\n'+
 '2/1 G5:q F#5:e G5:e A5:q [A4,C5,F#5]:q\n'+
 '2/2 R:e [G4,B4]:e R:e [G4,C#5]:e [F#4,D5]:q R:q\n'+
 'P {"i":"piano-lh","n":"piano"}\n'+
 '1/1 G3:q B3:q D4:q D3:q\n'+
 '2/1 E3:q A3:q D3:q D2:e E2:e F#2:e';
const original=runtime.score.decode(answer);
assert(runtime.xml.convert(original).warnings.some(x=>x.includes('länger')));
assert.throws(()=>runtime.context.combine(base,runtime.xml.convert(original).xml,
 {kind:'prependPrelude',targetGroups:[targets[2],targets[3]]}),/Instrument 2, Takt 2/);
const data=runtime.score.decode(answer);
const warnings=repair(data);
assert.strictEqual(warnings.length,1);
assert(warnings[0].includes('Triole'));
assert.strictEqual(runtime.xml.convert(data).warnings.length,0);
const normalized=runtime.score.encode(data);
assert(normalized.includes('(3:2:e D2:e E2:e F#2:e )'));
const merged=runtime.context.combine(base,runtime.xml.convert(data).xml,
 {kind:'prependPrelude',targetGroups:[targets[2],targets[3]]});
assert.strictEqual(runtime.context.inspect(merged.xml,0).meters.length,34);
const parts=runtime.context.parse(merged.xml).children.filter(x=>x.name==='part');
assert.strictEqual(parts.length,4);
assert(parts.every(p=>p.children.filter(x=>x.name==='measure').length===34));
const falseRepair=runtime.score.decode(answer.replace('D2:e E2:e F#2:e','D2:q E2:q'));
assert.strictEqual(repair(falseRepair).length,0);
console.log('0.11.10 diagnosed user case: 4 part targets, 4.5 beat error, no-loss triplet repair and 34-bar merge PASS');
