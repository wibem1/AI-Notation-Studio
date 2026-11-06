'use strict';
// Embedded QML runtime smoke test; no provider calls or MuseScore installation needed.
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const qml=fs.readFileSync(path.join(__dirname,'..','AI-Notation-Studio-App-0.11.9.qml'),'utf8');
assert.match(qml,/version:\s*"0\.11\.9"/);
assert.match(qml,/Vorspiel voranstellen/);
assert.match(qml,/preludeSelectedIndices/);
assert.match(qml,/mode===9/);
assert.match(qml,/targetGroups:job.preludeTargets\|\|null/);
const start=qml.indexOf('    function createCompactRuntime() {');
const end=qml.indexOf('    // END COMPACTSCORE RUNTIME',start);
assert(start>0&&end>start);
const runtime=Function(qml.slice(start,end)+';return createCompactRuntime()')();
const fixture=fs.readFileSync(path.join(__dirname,'fixtures','Herbstlicher-Abendgesang.cs'),'utf8');
const intro='CS1\nS {"t":"Vorspiel","k":"d minor","m":"4/4","b":{"v":72}}\nP {"i":"piano","n":"piano"}\n'+
 '1/1 A4:q D5:q F5:e E5:e D5:q\n'+
 '1/2 D3:e A3:e F3:e A3:e D3:e A3:e F3:e A3:e\n'+
 '2/1 Bb4:q. A4:e G4:h\n'+
 '2/2 G2:e D3:e Bb2:e D3:e G2:e D3:e Bb2:e D3:e';
const original=runtime.xml.convert(runtime.score.decode(fixture)).xml;
const generated=runtime.xml.convert(runtime.score.decode(intro)).xml;
let catalog=runtime.context.preludeCatalog(original);
assert.deepEqual(catalog.map(c=>c.indices),[[0]]);
let result=runtime.context.combine(original,generated,{kind:'prependPrelude',targetGroups:[catalog[0]]});
assert.equal(runtime.context.inspect(result.xml,0).meters.length,18);
assert.equal(runtime.context.inspect(original,0).meters.length,16);
let split=runtime.context.expandPreludeParts(original,[{splitPiano:true,indices:[0,1]}]);
split=split.replace('<score-part id="prelude_0_2">','<score-part id="prelude_0_2" print-object="no">');
catalog=runtime.context.preludeCatalog(split);
assert.equal(catalog.length,1);
assert.deepEqual(catalog[0].indices,[0,1]);
result=runtime.context.combine(split,generated,{kind:'prependPrelude',targetGroups:[catalog[0]]});
const tree=runtime.context.parse(result.xml);
const parts=tree.children.filter(x=>x&&typeof x!=='string'&&x.name==='part');
assert.equal(parts.length,2);
assert.deepEqual(parts.map(p=>p.children.filter(x=>x&&typeof x!=='string'&&x.name==='measure').length),[18,18]);
assert.equal(runtime.context.inspect(split,0).meters.length,16);
console.log('0.11.9 embedded workflow: normal piano and split piano passed');
