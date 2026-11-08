// Exercise the actual QML MusicXML repair engine against synthetic scores.
// No AI, MuseScore process or external packages.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('AI-Notation-Studio-App.qml','utf8');
const begin=source.indexOf('function createNotationStructure(');
const end=source.indexOf('// The adapter only uses',begin);
assert(begin>0&&end>begin,'source notation engine available');
function parse(xml){
 const root={name:'ROOT',children:[]}, stack=[root];
 for(const token of xml.match(/<[^>]*>|[^<]+/g)||[]){
   if(token.startsWith('<?')||token.startsWith('<!'))continue;
   if(token.startsWith('</')){assert(stack.length>1);stack.pop().close=token;continue;}
   if(token.startsWith('<')){
      const name=/^<([-\w]+)/.exec(token);
      assert(name,'node name');
      const node={name:name[1],open:token,close:'',children:[]};
      stack[stack.length-1].children.push(node);
      if(!token.endsWith('/>'))stack.push(node);
   }else stack[stack.length-1].children.push(token);
 }
 assert.equal(stack.length,1,'balanced XML');
 return root.children.find(n=>n.name==='score-partwise');
}
const engine=new Function('context',source.slice(begin,end)+
  '\nreturn createNotationStructure(context);')({parse});
const clef=(sign,line,attrs='')=>`<clef${attrs}><sign>${sign}</sign><line>${line}</line></clef>`;
const note=(pitch)=>`<note><pitch><step>${pitch}</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>`;
const bar=(n,attrs,pitch)=>`<measure number="${n}"><attributes>${attrs}</attributes>${note(pitch)}</measure>`;
const xml='<score-partwise><part id="P1">'+
bar(1,'<divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time>'+clef('G',2),'C')+
bar(2,clef('G',2),'D')+bar(3,clef('F',4),'E')+bar(4,clef('F',4),'F')+
'</part></score-partwise>';
function repair(x,sel={partIndex:0,staffs:[1],startQuarter:4,endQuarter:12}){
 return engine.repairRedundantClefs(x,sel);
}
const result=repair(xml);
assert.equal(result.changed,1,'remove only the selected repeated G clef');
assert.match(result.report,/Takt 2/);
assert.equal((result.xml.match(/<clef/g)||[]).length,3,'keep changed F clef and outside-selection repeat');
assert.equal(engine.signature(xml),engine.signature(result.xml),'preserve music');
assert.equal(repair(result.xml).changed,0,'repair is idempotent');
assert.equal(repair(xml,{partIndex:0,staffs:[1],startQuarter:8,endQuarter:12}).changed,0,
 'changed clef is not redundant');
const styled=xml.replace('<measure number="2"><attributes><clef>', 
 '<measure number="2"><attributes><clef print-object="yes">');
assert.equal(repair(styled).changed,0,'do not remove decorated clefs');
const noFirst=xml.replace(clef('G',2),'');
assert.equal(repair(noFirst).changed,0,'no assumed clef history');
// Rhythmic readability: adding missing beams must never alter duration/pitch.
const eighth=(p)=>`<note><pitch><step>${p}</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>`;
function beamFixture(beats,kind,n){
 return '<score-partwise><part id="P1"><measure number="1"><attributes>'+
 '<divisions>2</divisions><time><beats>'+beats+'</beats><beat-type>'+kind+
 '</beat-type></time></attributes>'+Array(n).fill(0).map((_,i)=>eighth('CDEFGABC'[i%8])).join('')+
 '</measure></part></score-partwise>';
}
const straight=beamFixture(4,4,8);
const straightPlan=engine.repairMissingBeams(straight,{partIndex:0,staffs:[1],startQuarter:0,endQuarter:4});
assert.equal(straightPlan.changed,4,'four quarter-beat pairs');
assert.equal((straightPlan.xml.match(/<beam number="1">/g)||[]).length,8);
assert.equal(engine.signature(straight),engine.signature(straightPlan.xml));
assert.equal(engine.repairMissingBeams(straightPlan.xml,{partIndex:0,staffs:[1],startQuarter:0,endQuarter:4}).changed,0,'idempotent beaming');
const compound=beamFixture(6,8,6);
const compoundPlan=engine.repairMissingBeams(compound,{partIndex:0,staffs:[1],startQuarter:0,endQuarter:3});
assert.equal(compoundPlan.changed,2,'two groups of three eighths in 6/8');
assert.equal((compoundPlan.xml.match(/<beam number="1">/g)||[]).length,6);
assert.equal(engine.signature(compound),engine.signature(compoundPlan.xml));
const skipped=straight.replace('<type>eighth</type></note>', '<type>eighth</type><notations><slur type="start"/></notations></note>');
assert.equal(engine.repairMissingBeams(skipped,{partIndex:0,staffs:[1],startQuarter:0,endQuarter:4}).changed,0,'do not touch special notation');
assert.equal(engine.repairMissingBeams(straight,{partIndex:0,staffs:[1],startQuarter:4,endQuarter:8}).changed,0,'no out-of-selection edit');
const combined=engine.repairSafeVisual(straight,{partIndex:0,staffs:[1],startQuarter:0,endQuarter:4});
assert.equal(combined.changed,4,'combined repair includes rhythmic beaming');
console.log('PASS: redundant-clef correction, music identity, scope, style guard and idempotence');
console.log('PASS: eighth-beam correction for 4/4 and 6/8; sound, selection and notation guards');
