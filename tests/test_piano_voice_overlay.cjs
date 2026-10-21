const assert = require('assert');
const context = require('../compactscore-context.js');
function note(st,voice,step) {
 return '<note>' + (step ? '<pitch><step>'+step+'</step><octave>4</octave></pitch>' : '<rest/>') + '<duration>4</duration><voice>'+voice+'</voice><staff>'+st+'</staff><type>whole</type></note>';
}
function measure(i,notes,first) {
 return '<measure number="'+i+'">'+(first?'<attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time><staves>2</staves></attributes>':'')+notes+'</measure>';
}
const hand = (a,b) => note(1,1,a)+'<backup><duration>4</duration></backup>'+note(2,2,b);
const violin = measure(1,note(1,1,null),true)+measure(2,note(1,1,'D'),false);
const piano = measure(1,hand(null,null),true)+measure(2,hand('C','G'),false);
const base = '<score-partwise><part-list><score-part id="P1"><part-name>Violine</part-name></score-part><score-part id="P2"><part-name>Klavier</part-name></score-part></part-list><part id="P1">'+violin+'</part><part id="P2">'+piano+'</part></score-partwise>';
const added = '<score-partwise><part-list><score-part id="X"><part-name>Klavier</part-name></score-part></part-list><part id="X">'+measure(1,hand(null,null),true)+measure(2,hand('E','F'),false)+'</part></score-partwise>';
const output = context.combine(base,added,{kind:'overlay',startQuarter:0,endQuarter:8,targetInstrument:'Klavier'}).xml;
assert.equal((output.match(/<part id=/g)||[]).length,2);
assert(output.includes('<part id="P1">'+violin+'</part>'));
assert(output.includes('<voice>3</voice>'));
assert(output.includes('<voice>4</voice>'));
assert.throws(()=>context.combine(base,added,{kind:'overlay',startQuarter:1,endQuarter:8,targetInstrument:'Klavier'}));
console.log('Piano voice overlay tests PASS');