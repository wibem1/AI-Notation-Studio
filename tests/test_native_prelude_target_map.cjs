const assert=require('node:assert/strict');
const bind=require('../native-prelude-target-map.js');
const score={nstaves:3,parts:[
  {instrumentId:'flute',startTrack:0,endTrack:4},
  {instrumentId:'piano',startTrack:4,endTrack:12}
]};
const make=(instrument,id,ids)=>({id,instrument,measures:[1,2].map(number=>({
  number,voices:ids.map(voice=>({voice,events:[{type:'rest',duration:'whole'}]}))
}))});
const flute=make('flute','p1',[1]);
const piano=make('piano','p2',[1,2,3]);
const d={parts:[flute,piano]};
const groups=[{indices:[0],splitPiano:false},{indices:[1],splitPiano:false}];
const explicit={'p2':[
  {sourceVoice:1,targetStaff:0,targetVoice:0},
  {sourceVoice:2,targetStaff:0,targetVoice:1},
  {sourceVoice:3,targetStaff:1,targetVoice:0}
]};
const job={mode:9,preludeTargets:groups,nativeVoiceMapping:explicit};
const original=JSON.stringify({score,d,job});
const actual=bind(score,d,job);
assert.deepEqual(actual,[
  {sourcePart:'p1',targetPartIndex:0,voices:[{sourceVoice:1,targetStaff:0,targetVoice:0}]},
  {sourcePart:'p2',targetPartIndex:1,voices:explicit.p2}
]);
assert.equal(JSON.stringify({score,d,job}),original,'Binding must be read-only');
let rejects=0;
function reject(d2,j2,s2=score){assert.throws(()=>bind(s2,d2,j2));rejects++;}
reject(d,{...job,nativeVoiceMapping:undefined});
reject(d,{...job,mode:3});
reject(d,{...job,preludeTargets:[groups[0],{indices:[0],splitPiano:false}]});
reject(d,{...job,preludeTargets:[groups[0],{indices:[1,2],splitPiano:true}]});
reject(d,{...job,preludeTargets:[groups[0]]});
reject({parts:[flute,{...piano,id:'p1'}]},job);
reject({parts:[flute,{...piano,instrument:'violin'}]},job);
reject(d,{...job,nativeVoiceMapping:{p2:explicit.p2.slice(0,2)}});
reject(d,{...job,nativeVoiceMapping:{p2:[explicit.p2[0],explicit.p2[0],explicit.p2[2]]}});
// Reject a secondary voice on staff 2 when that staff has no primary voice.
reject(d,{...job,nativeVoiceMapping:{p2:[explicit.p2[0],{sourceVoice:2,targetStaff:1,targetVoice:1},{sourceVoice:3,targetStaff:0,targetVoice:2}]}});
reject(d,{...job,nativeVoiceMapping:{p2:[explicit.p2[0],{sourceVoice:2,targetStaff:0,targetVoice:0},explicit.p2[2]]}});
reject(d,{...job,nativeVoiceMapping:{p2:[explicit.p2[0],{sourceVoice:2,targetStaff:2,targetVoice:0},explicit.p2[2]]}});
reject(d,job,{...score,parts:[score.parts[0],{...score.parts[1],startTrack:5}]});
console.log('Native output part mapping PASS: exact piano voice/staff mapping; '+rejects+' unsafe cases rejected; read-only');
