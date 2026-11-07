const assert = require('node:assert/strict');
const fs = require('node:fs');
const codec = require('../compactscore.js');
const makeWriter = require('../native-prelude-writer.js');
const source = fs.readFileSync(__dirname+'/fixtures/native-prelude.cs','utf8');
const data = codec.decode(source);
const mapping = [{sourcePart:'piano',targetPartIndex:1,voices:[
  {sourceVoice:1,targetStaff:0,targetVoice:0},
  {sourceVoice:2,targetStaff:0,targetVoice:1},
  {sourceVoice:3,targetStaff:1,targetVoice:0}
]}];
let mutations = 0;
const score = {nmeasures:4,nstaves:3,parts:[
  {startTrack:0,endTrack:4,instrumentId:'flute'},
  {startTrack:4,endTrack:12,instrumentId:'piano'}
],startCmd(){mutations++}};
const writer = makeWriter();
const plan = writer.prepare(score,data,mapping);
assert.equal(plan.measures,2);
assert.equal(plan.events.length,22);
assert.deepEqual([...new Set(plan.events.map(e=>e.staff*4+e.voice))],[4,5,8]);
assert.equal(plan.events.filter(e=>!e.notes.length).length,6);
assert(plan.events.some(e=>e.notes.length===3));
assert(plan.events.some(e=>e.duration===720));
assert(plan.events.some(e=>e.notes.some(n=>n.midi===78&&n.tpc===20))); // F#5 spelling
const original=JSON.stringify(data), originalMap=JSON.stringify(mapping);
const rejects = [
  d=>d.parts[0].markings=[{type:'pedal',start:{measure:1,beat:1},end:{measure:2,beat:4}}],
  d=>d.parts[0].measures[0].voices[0].events[0].tie='start',
  d=>d.parts[0].measures[0].voices[0].events[0].type='tupletStart',
  d=>d.parts[0].measures[0].voices[0].events[0].grace=true,
  d=>d.parts[0].measures[0].voices[0].events.pop(),
  d=>d.parts[0].measures[0].voices[0].events.push({type:'rest',duration:'quarter'}),
  d=>d.parts[0].measures[1].voices.pop(),
  d=>d.parts[0].measures[1].number=3,
  d=>d.score.tempo={bpm:84},
  d=>d.score.key='d minor'
];
for(const corrupt of rejects){const copy=JSON.parse(original);corrupt(copy);assert.throws(()=>writer.prepare(score,copy,mapping));}
for(const corrupt of [m=>m[0].voices[1].targetVoice=0,m=>m[0].voices[2].targetStaff=2,m=>m[0].targetPartIndex=0]){
  const copy=JSON.parse(originalMap);corrupt(copy);assert.throws(()=>writer.prepare(score,data,copy));
}
assert.equal(mutations,0,'preflight must never mutate the host');
assert.equal(JSON.stringify(data),original,'source must stay unchanged');
assert.equal(JSON.stringify(mapping),originalMap,'mapping must stay unchanged');
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({data,mapping}));
console.log('Native CS1 plan PASS: 2 bars, 3 mapped voices, 22 events; 13 invalid cases rejected before mutation');
