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

const note=(p)=>'<note><pitch><step>'+p+'</step><octave>4</octave></pitch>'+
  '<duration>4</duration><type>whole</type></note>';
const first=(p)=>'<measure number="1"><attributes><divisions>1</divisions>'+
  '<time><beats>4</beats><beat-type>4</beat-type></time></attributes>'+
  note(p)+'</measure>';
const second=(p)=>'<measure number="2">'+note(p)+'</measure>';
const orig='<score-partwise><part id="P1">'+first('C')+second('D')+
  '</part><part id="P2">'+first('G')+second('A')+'</part></score-partwise>';
const selection={partIndex:0,staffs:[1],startQuarter:4,endQuarter:8};
assert.deepEqual(engine.rewriteTargets(orig,selection),[{index:1,number:'2'}]);
const revised=second('D').replace('</note>','<stem>up</stem></note>');
const good=engine.prepareRewrite(orig,selection,[{index:1,xml:revised}]);
assert.equal(good.changed,1);
assert.equal(engine.signature(orig),engine.signature(good.xml),'same sounding music');
assert(good.xml.includes(first('G')) && good.xml.includes(second('A')),
  'all other parts and measures retained');
assert(good.xml.includes('<stem>up</stem>'),'actual corrected notation inserted');
function fails(proposals,sel=selection){
  assert.throws(()=>engine.prepareRewrite(orig,sel,proposals));
}
fails([{index:0,xml:first('C')}]);
fails([{index:1,xml:second('E')}]);
fails([{index:1,xml:revised},{index:1,xml:revised}]);
fails([{index:1,xml:second('D').replace('number="2"','number="3"')}]);
fails([{index:1,xml:second('D').replace('</note>','<notations><articulations><staccato/></articulations></notations></note>')}]);
fails([{index:1,xml:'<measure number="2"><direction><direction-type><dynamics><f/></dynamics></direction-type></direction>'+note('D')+'</measure>'}]);
fails([{index:1,xml:revised}],{partIndex:0,staffs:[2],startQuarter:4,endQuarter:8});
console.log('PASS: AI MusicXML rewrite, scope, score invariants, expressive mark and selection guards');
