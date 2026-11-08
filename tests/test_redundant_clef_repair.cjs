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
console.log('PASS: redundant-clef correction, music identity, scope, style guard and idempotence');
