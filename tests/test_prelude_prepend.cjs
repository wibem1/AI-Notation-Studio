'use strict';
const assert = require('node:assert/strict');
const C = require('../compactscore-context.js');
function parts(names, count, staves) {
 const list=names.map((name,i)=>'<score-part id="P'+(i+1)+'"><part-name>'+name+'</part-name></score-part>').join('');
 const body=names.map((name,i)=>'<part id="P'+(i+1)+'">'+Array.from({length:count},(_,j)=>{
  const a=j===0?'<attributes><divisions>4</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time>'+(staves[i]===2?'<staves>2</staves>':'')+'<clef><sign>G</sign><line>2</line></clef></attributes>':'';
  const n='<note><pitch><step>C</step><octave>4</octave></pitch><duration>16</duration><voice>1</voice><staff>1</staff><type>whole</type></note>';
  return '<measure number="'+(j+1)+'">'+a+n+(staves[i]===2?'<backup><duration>16</duration></backup><note><pitch><step>C</step><octave>3</octave></pitch><duration>16</duration><voice>2</voice><staff>2</staff><type>whole</type></note>':'')+'</measure>';
 }).join('')+'</part>').join('');
 return '<score-partwise version="4.0"><part-list>'+list+'</part-list>'+body+'</score-partwise>';
}
function elems(node,name){return node.children.filter(c=>typeof c!=='string'&&c.name===name);}
function isRest(measure){return elems(measure,'note').every(n=>elems(n,'rest').length===1);}
function measures(part){return elems(part,'measure');}
function test(names,targets,generated){
 const original=parts(names,3,names.map(n=>n==='Grand Piano'?2:1));
 const result=C.prependPrelude(original,generated,{targetPartIndices:targets});
 assert.equal(original,parts(names,3,names.map(n=>n==='Grand Piano'?2:1)),'Source mutated');
 const before=elems(C.parse(original),'part'), after=elems(C.parse(result.xml),'part');
 assert.equal(before.length,after.length);
 after.forEach((part,i)=>{
  assert.equal(measures(part).length,5);
  for(let j=0;j<2;j++) assert.equal(isRest(measures(part)[j]),!targets.includes(i),'target silence mismatch');
  for(let j=0;j<3;j++){
   assert.deepEqual(elems(measures(part)[j+2],'note'),elems(measures(before[i])[j],'note'),'original notes changed');
  }
 });
}
test(['Flöte','Violine','Cello'],[1],parts(['Violine'],2,[1]));
test(['Flöte','Violine','Cello'],[0,2],parts(['Flöte','Cello'],2,[1,1]));
test(['Flöte','Violine','Grand Piano'],[2],parts(['Grand Piano'],2,[2]));
test(['Piano','Piano'],[1],parts(['Piano'],2,[1]));
test(['Flöte','Violine','Klavier','Klavier'],[2,3],parts(['Klavier','Klavier'],2,[1,1]));
assert.throws(()=>C.prependPrelude(parts(['Flöte','Violine'],3,[1,1]),parts(['Violine'],2,[1]),{targetPartIndices:[8]}),/Zielinstrumente/);
assert.throws(()=>C.prependPrelude(parts(['Flöte','Violine'],3,[1,1]),parts(['Violine','Violine'],2,[1,1]),{targetPartIndices:[1,1]}),/Zielinstrumente/);
assert.throws(()=>C.prependPrelude(parts(['Klavier'],3,[2]),parts(['Klavier'],2,[1]),{targetPartIndices:[0]}),/Notensystemzahl/);
console.log('prelude regression: 5 positive + 3 negative cases passed');
