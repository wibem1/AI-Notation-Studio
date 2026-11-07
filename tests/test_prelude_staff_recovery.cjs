// Synthetic regression only. Never upload the user's diagnostic or source score.
const assert=require('node:assert/strict'),fs=require('node:fs');
const cs=require('../compactscore.js'),xml=require('../compactscore-musicxml.js'),ctx=require('../compactscore-context.js');
const N=(pitch,duration='whole')=>({type:'note',pitch,duration});
const R=()=>({type:'rest',duration:'whole'});
const part=(id,instrument,voices,count)=>({id,instrument,measures:Array.from({length:count},(_,i)=>({number:i+1,voices:voices.map((events,v)=>({voice:v+1,events:events.map(e=>({...e}))}))}))});
const score=parts=>({format:'AI-Notation-Maxi',version:'0.1',score:{title:'ANS-TEST-StaffRecovery',key:'g major',timeSignature:'4/4',tempo:{bpm:88,text:'Moderato'}},parts});
const original=score([part('violin','violin',[[N('D5')]],32),part('piano','piano',[[N('G4','half'),N('B4','half')],[N('G3')]],32),part('bass','flute',[[N('G2')]],32)]);
const serialize=n=>typeof n==='string'?n:n.open+n.children.map(serialize).join('')+n.close;
const nodes=(n,name)=>n.children.filter(x=>x&&typeof x!=='string'&&x.name===name);
const origTree=ctx.parse(xml.convert(original).xml);
const lastDef=nodes(nodes(origTree,'part-list')[0],'score-part')[2];
nodes(lastDef,'part-name')[0].children=['Piano bass'];
nodes(lastDef,'score-instrument').forEach(i=>nodes(i,'instrument-sound').forEach(n=>n.children=['keyboard.piano']));
nodes(lastDef,'midi-instrument').forEach(i=>nodes(i,'midi-program').forEach(n=>n.children=['1']));
const base=serialize(origTree);
const active=part('active','piano',[[N('G5','quarter'),N('D5','quarter'),N('B4','quarter'),N('G4','quarter')],[N('G2','half'),N('D3','half')]],2);
active.measures[0].voices[0].events[0].id='start';active.measures[1].voices[0].events[3].id='end';
active.markings=[{type:'dynamic',position:{measure:1,beat:1},value:'mp'},
 {type:'pedal',start:{measure:1,beat:1},end:{measure:2,beat:4}},
 {type:'hairpin',kind:'crescendo',start:{measure:1,beat:1},end:{measure:2,beat:1}},
 {type:'slur',startRef:'start',endRef:'end'}];
const addition=score([part('silent','piano',[[R()]],2),active]);
const incoming=xml.convert(addition).xml;
const options={targetGroups:[{indices:[1],splitPiano:false},{indices:[2],splitPiano:false}]};
const allParts=tree=>nodes(tree,'part').map(p=>nodes(p,'measure'));
function canonical(n){if(typeof n==='string')return n.trim()||null;return {name:n.name,open:n.name==='measure'?n.open.replace(/number=["'][^"']+["']/,'number="N"'):n.open,close:n.close,children:n.children.map(canonical).filter(n=>n!==null)};}
function check(context){
 const snapshot=JSON.stringify({base,incoming,options});
 const out=context.prependPrelude(base,incoming,options),old=allParts(ctx.parse(base)),now=allParts(ctx.parse(out.xml));
 assert.deepEqual(now.map(p=>p.length),[34,34,34]);
 for(let p=0;p<3;p++)for(let m=0;m<32;m++)assert.deepEqual(canonical(now[p][m+2]),canonical(old[p][m]),'original changed');
 const generated=allParts(ctx.parse(incoming))[1];
 for(let m=0;m<2;m++){
  assert.deepEqual(nodes(now[1][m],'note').map(canonical),nodes(generated[m],'note').map(canonical),'new piano music changed');
  for(const direction of nodes(generated[m],'direction'))assert(nodes(now[1][m],'direction').some(n=>serialize(n)===serialize(direction)),'expression missing');
  assert(nodes(now[0][m],'note').every(n=>nodes(n,'rest').length),'unselected violin must rest');
  assert(nodes(now[2][m],'note').every(n=>nodes(n,'rest').length),'additional piano must rest');
 }
 assert(out.warnings.some(w=>w.includes('Zuordnung korrigiert')));
 assert.equal(JSON.stringify({base,incoming,options}),snapshot,'source mutated');
 return out.xml;
}
const output=check(ctx);
// Actual embedded runtime, not just the source module.
const vm=require('node:vm');
const app=fs.readFileSync(process.env.PRELUDE_RECOVERY_APP||'tests/AI-Notation-Studio-App-prelude-recovery.qml','utf8');
const a=app.indexOf('    function createCompactRuntime()'),b=app.indexOf('    // END COMPACTSCORE RUNTIME',a);
const scope={};vm.createContext(scope);vm.runInContext(app.slice(a,b)+'\nthis.compact=createCompactRuntime();',scope);check(scope.compact.context);
const twoActive=score([part('also-active','piano',[[N('C5')],[N('C3')]],2),active]);
assert.throws(()=>ctx.prependPrelude(base,xml.convert(twoActive).xml,options),/Notensystemzahl/);
const other=ctx.parse(base),def=nodes(nodes(other,'part-list')[0],'score-part')[2];
nodes(def,'midi-instrument').forEach(i=>nodes(i,'midi-program').forEach(n=>n.children=['41']));
assert.throws(()=>ctx.prependPrelude(serialize(other),incoming,options),/Notensystemzahl/);
if(process.env.PRELUDE_RECOVERY_XML)fs.writeFileSync(process.env.PRELUDE_RECOVERY_XML,output);
if(process.env.PRELUDE_RECOVERY_BASE)fs.writeFileSync(process.env.PRELUDE_RECOVERY_BASE,base);
if(process.env.PRELUDE_RECOVERY_REQUEST)fs.writeFileSync(process.env.PRELUDE_RECOVERY_REQUEST,JSON.stringify({correct:cs.encode(addition),bad:cs.encode(twoActive)}));
console.log('Prelude staff recovery PASS: 32→34, 96 original measures intact, both piano hands/expressions retained; ambiguous/mixed-instrument cases rejected; embedded runtime matches');
