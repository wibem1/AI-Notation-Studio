// Exercise the actual QML control flow with a real structural repair fixture.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const qml=fs.readFileSync('AI-Notation-Studio-App.qml','utf8');
const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync('notation-structure.js','utf8'),scope);
const structure=scope.createNotationStructure(require('../compactscore-context.js'));
const note=(p,o,d,v)=>`<note><pitch><step>${p}</step><octave>${o}</octave></pitch><duration>${d}</duration><voice>${v}</voice><type>quarter</type></note>`;
const xml='<score-partwise><part-list/><part id="P1"><measure number="1"><attributes><divisions>4</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>'+note('C',2,16,4)+'<backup><duration>12</duration></backup>'+note('E',3,12,3)+'<backup><duration>8</duration></backup>'+note('G',3,8,2)+'<backup><duration>4</duration></backup>'+note('C',4,4,1)+'</measure></part></score-partwise>';
const result=structure.repair(xml,{partIndex:0,staffs:[1],startQuarter:0,endQuarter:4});
assert.equal(result.changed,1);assert.equal(structure.signature(xml),structure.signature(result.xml));
function load(){
 const score={is(other){return this===other},parts:[{startTrack:0}],selection:{}};
 const snapshot={score,sourceXml:xml,xml:result.xml,changed:result.changed,operations:result.operations,selection:{partIndex:0,staffs:[1],startQuarter:0,endQuarter:4},fingerprint:'initial'};
 const s={busy:false,curScore:score,structureSnapshot:snapshot,notationSnapshot:{},notationChanges:[{}],structureReport:'Prepared',structureStatus:'',statusText:'',notationStructure:structure,
 notationStructureExport(){return xml},fileUrlToLocalPath(x){return x},Qt:{resolvedUrl(x){return x}},writes:[],reads:[],writeVerifiedCompactFile(path,data){s.writes.push({path,data})},readScore(path,noninteractive){s.reads.push({path,noninteractive});return true},mscoreMajorVersion:4,mscoreMinorVersion:7,readSelectionForChat(){return 'initial'},notationDirect:{apply(){throw Error('Haltebogen nicht übernommen')}},Direction:{UP:1,DOWN:2}};
 vm.createContext(s);
 const begin=qml.indexOf('    function notationStructureApplyNow()');const end=qml.indexOf('    function notationPitchClass',begin);
 vm.runInContext(qml.slice(begin,end),s);return s;
}
let s=load();s.notationStructureApplyNow();assert(s.structureSnapshot);assert.equal(s.busy,false);assert(s.structureStatus.includes('Haltebogen'));assert(s.structureStatus.includes('Korrigierte Partitur öffnen'));
s.readSelectionForChat=()=> 'selection-cleared-by-native-command';s.notationStructureOpen();assert.equal(s.reads.length,1);assert.equal(s.reads[0].noninteractive,false);assert.equal(s.writes[0].data,result.xml);assert.equal(s.structureSnapshot,null);assert.equal(s.notationSnapshot,null);assert.equal(s.notationChanges.length,0);assert(s.structureStatus.includes('Korrigierte Partitur geöffnet'));
s=load();s.notationStructureExport=()=>xml+'<!-- user edit -->';s.notationStructureOpen();assert.equal(s.reads.length,0);assert(s.structureSnapshot);assert(s.structureStatus.includes('erneut prüfen'));
s=load();s.structureSnapshot.xml=result.xml.replace('<step>C</step>','<step>D</step>');s.notationStructureOpen();assert.equal(s.reads.length,0);assert(s.structureStatus.includes('Klangprüfung'));assert(s.structureSnapshot);
s=load();s.readScore=()=>false;s.notationStructureOpen();assert(s.structureSnapshot);assert(!s.structureStatus.includes('Partitur geöffnet:'));s.readScore=()=>true;s.notationStructureOpen();assert.equal(s.structureSnapshot,null);
s=load();s.writeVerifiedCompactFile=()=>{throw Error('disk full')};s.notationStructureOpen();assert.equal(s.reads.length,0);assert(s.structureSnapshot);assert(s.structureStatus.includes('disk full'));
assert(qml.includes('objectName: "notationStructureOpenButton"'));assert(qml.includes('onClicked: notationStructureOpen()'));assert(qml.includes('objectName: "notationStructureStatusView"'));
console.log('Actual QML correction-copy flow: real structural output, sound equality, native-failure recovery, selection independence, stale-score guard, acoustic rejection, read/write failure and retry: PASS. MuseScore readScore is a test substitute.');

const applyBegin=qml.indexOf('    function notationStructureApply()');const applyEnd=qml.indexOf('    function notationStructureApplyNow()',applyBegin);
const wrapper=qml.slice(applyBegin,applyEnd);assert(!wrapper.includes('.hide('));assert(!wrapper.includes('Timer'));assert(!qml.includes('directApplyTimer'));
let calls=0,hideCalls=0;const host={busy:false,structureSnapshot:{},notationStructureApplyNow(){calls++},root:{Window:{window:{hide(){hideCalls++}}}}};vm.createContext(host);vm.runInContext(wrapper,host);host.notationStructureApply();assert.equal(calls,1);assert.equal(hideCalls,0);host.busy=true;host.notationStructureApply();assert.equal(calls,1);
console.log('Direct correction wrapper runs immediately, keeps host visible, rejects duplicate busy requests PASS');
