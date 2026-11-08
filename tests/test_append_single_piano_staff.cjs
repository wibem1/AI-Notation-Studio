'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const qml=fs.readFileSync('AI-Notation-Studio-App.qml','utf8');
function section(a,b) {
 const start=qml.indexOf(a),end=qml.indexOf(b,start+a.length);
 assert(start>=0&&end>start,'Missing section '+a);
 return qml.slice(start,end);
}
const compact=vm.runInNewContext(section('function createCompactRuntime()','// END COMPACTSCORE RUNTIME')+'\ncreateCompactRuntime()');
const normalize=vm.runInNewContext(section('    function alignContinuationPianoStaves(','    function workflowCombine(')+'\nalignContinuationPianoStaves',{compact});
const cs=['CS1','S {"t":"ANS-TEST-Append","m":"4/4"}',
'P {"i":"violin","n":"violin"}','1/1 A4:w',
'P {"i":"piano","n":"piano"}','1/1 C5:w',
'P {"i":"piano_2","n":"piano"}','1/1 A2:w'].join('\n');
const generated=compact.xml.convert(compact.score.decode(cs)).xml;
const tree=compact.context.parse(generated);
const parts=tree.children.filter(x=>x.name==='part');
const get=(n,t)=>n.children.filter(x=>x&&typeof x!=='string'&&x.name===t);
const str=n=>typeof n==='string'?n:n.open+n.children.map(str).join('')+n.close;
for(let i=1;i<3;i++) {
 const attrs=get(get(parts[i],'measure')[0],'attributes')[0];
 attrs.children=attrs.children.filter(x=>x.name!=='staves'&&x.name!=='clef');
 attrs.children.push({name:'staves',open:'<staves>',close:'</staves>',children:['1']},
 {name:'clef',open:'<clef number="1">',close:'</clef>',children:[
 {name:'sign',open:'<sign>',close:'</sign>',children:[i===1?'G':'F']},
 {name:'line',open:'<line>',close:'</line>',children:[i===1?'2':'4']}
 ]});
}
const base=str(tree),job={mode:3,workflowKind:'append'};
const result=normalize(base,generated,job);
assert.equal(result.warnings.length,2);
const merged=compact.context.combine(base,result.xml,{kind:'append',startQuarter:4,endQuarter:4});
assert.equal(compact.context.inspect(merged.xml,0).meters.length,2);
const finalParts=get(compact.context.parse(merged.xml),'part');
assert.equal(finalParts.length,3);
assert(finalParts.every(p=>get(p,'measure').length===2));
assert(merged.xml.includes('<step>A</step><octave>2</octave>'),'LH note preserved');
assert(merged.xml.includes('<sign>F</sign><line>4</line>'),'Original bass clef preserved');
assert.equal(normalize(base,result.xml,job).warnings.length,0,'idempotent');
assert.equal(normalize(base,generated,{mode:5,workflowKind:'replace'}).xml,generated,'unrelated workflows unaffected');
// Any actual second-staff notes are a hard rejection with no changes.
const p2start=generated.indexOf('<part id="P2">');
const p2staff=generated.indexOf('<staff>1</staff>',p2start);
assert(p2staff>p2start,'piano note staff found');
const withSecondStaff=generated.slice(0,p2staff)+'<staff>2</staff>'+
 generated.slice(p2staff+'<staff>1</staff>'.length);
assert.throws(()=>normalize(base,withSecondStaff,job),/zweites Notensystem/);

// Regression: replaceTail transitions overwrite the last bar and append new bars.
// This was the real user workflow, not a simple append.
const csTail=['CS1','S {"t":"ANS-TEST-ReplaceTail","m":"4/4"}',
'P {"i":"violin","n":"violin"}','1/1 G4:w','2/1 A4:w',
'P {"i":"piano","n":"piano"}','1/1 D5:w','2/1 E5:w',
'P {"i":"piano_2","n":"piano"}','1/1 E2:w','2/1 A2:w'].join('\n');
const generatedTail=compact.xml.convert(compact.score.decode(csTail)).xml;
const tailJob={mode:3,workflowKind:'replaceTail'};
const alignedTail=normalize(base,generatedTail,tailJob);
assert.equal(alignedTail.warnings.length,2,'both split piano hands must be normalized');
const resultTail=compact.context.combine(base,alignedTail.xml,{kind:'replaceTail',startQuarter:0,endQuarter:4});
const tailParts=get(compact.context.parse(resultTail.xml),'part');
assert.equal(tailParts.length,3);
assert(tailParts.every(p=>get(p,'measure').length===2));
assert(resultTail.xml.includes('<step>E</step><octave>2</octave>'),'LH transition note preserved');
assert(resultTail.xml.includes('<step>A</step><octave>2</octave>'),'LH new note preserved');
assert(resultTail.xml.includes('<sign>F</sign><line>4</line>'),'Original LH clef preserved');
assert.equal(normalize(base,alignedTail.xml,tailJob).warnings.length,0,'replaceTail normalization idempotent');
assert.throws(()=>normalize(base,withSecondStaff,tailJob),/zweites Notensystem/,
    'replaceTail must refuse actual second-staff notes');
console.log('Single-staff piano continuation: full 3-part append, note preservation, bass clef, safety rejection PASS');
