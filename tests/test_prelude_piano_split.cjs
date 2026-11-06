'use strict';
const assert=require('node:assert/strict');
const C=require('../compactscore-context.js');
function part(id,name,hidden,staves,bars) {
 const def='<score-part id="'+id+'"'+(hidden?' print-object="no"':'')+'><part-name>'+name+'</part-name></score-part>';
 const m=Array.from({length:bars},(_,k)=>{
  const attrs=k===0?'<attributes><divisions>4</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time>'+(staves===2?'<staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef>':'<clef><sign>G</sign><line>2</line></clef>')+'</attributes>':'';
  const n='<note><pitch><step>C</step><octave>4</octave></pitch><duration>16</duration><voice>1</voice><staff>1</staff></note>';
  const lh=staves===2?'<backup><duration>16</duration></backup><note><pitch><step>C</step><octave>3</octave></pitch><duration>16</duration><voice>2</voice><staff>2</staff></note>':'';
  return '<measure number="'+(k+1)+'">'+attrs+n+lh+'</measure>';
 }).join('');
 return {def,part:'<part id="'+id+'">'+m+'</part>'};
}
function score(ps){return '<score-partwise version="4.0"><part-list>'+ps.map(p=>p.def).join('')+'</part-list>'+ps.map(p=>p.part).join('')+'</score-partwise>';}
function children(n,name){return n.children.filter(x=>x&&typeof x!=='string'&&x.name===name);}
function pitch(note){const p=children(note,'pitch')[0];return p?children(p,'octave')[0].children[0]:'rest';}
const base=score([part('F1','Flöte',false,1,3),part('V1','Violine',false,1,3),part('K1','Klavier',false,1,3),part('K2','Klavier',true,1,3)]);
const groups=C.preludeCatalog(base);
assert.equal(groups.length,3);
assert.deepEqual(groups[2].indices,[2,3]);
assert.equal(groups[2].splitPiano,true);
const intro=score([part('P1','Klavier',false,2,2)]);
const result=C.prependPrelude(base,intro,{targetGroups:[groups[2]]});
const ps=children(C.parse(result.xml),'part');
assert.equal(ps.length,4);
assert.deepEqual(ps.map(p=>children(p,'measure').length),[5,5,5,5]);
assert.deepEqual(ps.map(p=>children(children(p,'measure')[0],'note').map(pitch)),[['rest'],['rest'],['4'],['3']]);
const orig=children(C.parse(base),'part');
for(let i=0;i<4;i++)for(let k=0;k<3;k++){
 assert.deepEqual(children(children(ps[i],'measure')[k+2],'note'),children(children(orig[i],'measure')[k],'note'));
}
const twin=score([part('A','Klavier',false,1,1),part('B','Klavier',false,1,1)]);
assert.deepEqual(C.preludeCatalog(twin).map(g=>g.indices),[[0],[1]]);
assert.throws(()=>C.prependPrelude(base,score([part('P1','Klavier',false,1,2)]),{targetGroups:[groups[2]]}),/zweizeilige/);
console.log('Prelude target grouping and piano split: 4 positive/negative checks passed');
