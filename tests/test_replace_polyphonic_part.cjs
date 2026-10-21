const assert=require('assert'), ctx=require('../compactscore-context.js');
const note=(staff,voice,pitch)=>'<note><pitch><step>'+pitch+'</step><octave>4</octave></pitch><duration>4</duration><voice>'+voice+'</voice><staff>'+staff+'</staff></note>';
const measure=(i,pitches)=>'<measure number="'+i+'">'+(i===1?'<attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time><staves>2</staves></attributes>':'')+note(1,1,pitches[0])+'<backup><duration>4</duration></backup>'+note(1,2,pitches[1])+'<backup><duration>4</duration></backup>'+note(2,3,pitches[2])+'<backup><duration>4</duration></backup>'+note(2,4,pitches[3])+'</measure>';
const violin=Array.from({length:49},(_,i)=>'<measure number="'+(i+1)+'"><note><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration></note></measure>').join('');
const piano=Array.from({length:49},(_,i)=>measure(i+1,['C','D','E','F'])).join('');
const generated=Array.from({length:49},(_,i)=>measure(i+1,['G','A','B','C'])).join('');
const base='<score-partwise><part-list><score-part id="P1"><part-name>Violine</part-name></score-part><score-part id="P2"><part-name>Klavier</part-name></score-part></part-list><part id="P1">'+violin+'</part><part id="P2">'+piano+'</part></score-partwise>';
const added='<score-partwise><part-list><score-part id="X"><part-name>Klavier</part-name></score-part></part-list><part id="X">'+generated+'</part></score-partwise>';
const result=ctx.combine(base,added,{kind:'replaceInstrumentPart',partIndex:1,startQuarter:0,endQuarter:196}).xml;
assert(result.includes('<part id="P1">'+violin+'</part>'),'Original violin changed');
assert.equal((result.match(/<part id=/g)||[]).length,2,'Extra instrument appeared');
assert.equal((result.match(/<voice>4<\/voice>/g)||[]).length,49,'Polyphony lost');
assert(!result.includes('<step>F</step>'),'Old accompaniment not replaced');
assert.equal((result.match(/<step>B<\/step>/g)||[]).length,49,'Missing generated notes');
assert.throws(()=>ctx.combine(base,added,{kind:'replaceInstrumentPart',partIndex:1,startQuarter:1,endQuarter:196}));
assert.throws(()=>ctx.combine(base,added,{kind:'replaceInstrumentPart',partIndex:2,startQuarter:0,endQuarter:196}));
console.log('49-bar polyphonic piano replacement PASS');

const incompatibleDivisions=added.replace('<divisions>1</divisions>','<divisions>2</divisions>');
assert.throws(()=>ctx.combine(base,incompatibleDivisions,{kind:'replaceInstrumentPart',partIndex:1,startQuarter:0,endQuarter:196}),
 'Different MusicXML divisions must be rejected');
const silentBar=measure(49,['G','A','B','C']).replaceAll('<pitch><step>G</step><octave>4</octave></pitch>','<rest/>').replaceAll('<pitch><step>A</step><octave>4</octave></pitch>','<rest/>').replaceAll('<pitch><step>B</step><octave>4</octave></pitch>','<rest/>').replaceAll('<pitch><step>C</step><octave>4</octave></pitch>','<rest/>');
const silentOutput=added.replace(measure(49,['G','A','B','C']),silentBar);
assert.throws(()=>ctx.combine(base,silentOutput,{kind:'replaceInstrumentPart',partIndex:1,startQuarter:0,endQuarter:196}),
 'Empty accompaniment bar must be rejected');
console.log('Division mismatch and empty-bar guards PASS');
