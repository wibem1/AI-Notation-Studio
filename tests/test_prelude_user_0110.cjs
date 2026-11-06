'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const qml=fs.readFileSync('AI-Notation-Studio-App-0.11.10.qml','utf8');
const a=qml.indexOf('    function createCompactRuntime() {'),b=qml.indexOf('    // END COMPACTSCORE RUNTIME',a);
assert(a>0&&b>a);
const c=Function(qml.slice(a,b)+';return createCompactRuntime()')();
const cs='CS1\nS {"t":"Prelude","k":"g major","m":"4/4","b":{"v":96}}\n'+
'P {"i":"piano-rh","n":"piano"}\n'+
'1/1 D5:e G5:e B5:e D6:e C6:q B5:e A5:e\n'+
'1/2 R:e [G4,B4]:e R:e [G4,B4]:e R:e [F#4,A4]:e R:e [F#4,C5]:e\n'+
'2/1 G5:q F#5:e G5:e A5:q [A4,C5,F#5]:q\n'+
'2/2 R:e [G4,B4]:e R:e [G4,C#5]:e [F#4,D5]:q R:q\n'+
'P {"i":"piano-lh","n":"piano"}\n'+
'1/1 G3:q B3:q D4:q D3:q\n'+
'2/1 E3:q A3:q D3:q D2:e E2:e F#2:e\n';
const added=c.xml.convert(c.score.decode(cs)).xml;
const names=['Flöte','Violine','Klavier','Klavier, Klavier LH'];
const parts=names.map((n,i)=>{
 const two=i>=2,attrs='<attributes><divisions>4</divisions><key><fifths>1</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time>'+(two?'<staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef>':'<clef><sign>G</sign><line>2</line></clef>')+'</attributes>';
 const note='<note><rest measure="yes"/><duration>16</duration><voice>1</voice><staff>1</staff></note>';
 const backup=two?'<backup><duration>16</duration></backup><note><rest measure="yes"/><duration>16</duration><voice>2</voice><staff>2</staff></note>':'';
 return '<part id="P'+(i+1)+'">'+Array.from({length:32},(_,bar)=>'<measure number="'+(bar+1)+'">'+(bar===0?attrs:'')+note+backup+'</measure>').join('')+'</part>';
});
const def=names.map((n,i)=>'<score-part id="P'+(i+1)+'"><part-name'+(i>=2?' print-object="no"':'')+'>'+n+'</part-name></score-part>').join('');
const base='<score-partwise version="4.0"><part-list>'+def+'</part-list>'+parts.join('')+'</score-partwise>';
const cats=c.context.preludeCatalog(base);
assert.deepEqual(cats.map(x=>x.indices),[[0],[1],[2],[3]]);
assert.equal(cats[3].name,'Klavier, Klavier LH');
const out=c.context.prependPrelude(base,added,{targetGroups:[cats[2],cats[3]]});
assert(out.warnings.some(w=>w.includes('Vorschlagsnote')));
assert(out.xml.includes('<grace slash="yes"/>'));
const kids=(n,name)=>n.children.filter(x=>x&&typeof x!=='string'&&x.name===name);
const original=kids(c.context.parse(base),'part'),updated=kids(c.context.parse(out.xml),'part');
assert.equal(updated.length,4);
for(let i=0;i<4;i++){
 const o=kids(original[i],'measure'),n=kids(updated[i],'measure');
 assert.equal(n.length,34);
 for(let k=0;k<32;k++) assert.deepEqual(kids(o[k],'note'),kids(n[k+2],'note'));
}
assert(kids(kids(updated[0],'measure')[0],'note').every(n=>kids(n,'rest').length===1));
assert(kids(kids(updated[1],'measure')[0],'note').every(n=>kids(n,'rest').length===1));
assert.throws(()=>c.context.prependPrelude(base,c.xml.convert(c.score.decode(cs.replace('F#2:e','F#2:q'))).xml,{targetGroups:[cats[2],cats[3]]}),/Rhythmusfehler/);
console.log('Real diagnostic analogue: 4 parts 32->34, RH/LH, one grace repair, originals preserved');
