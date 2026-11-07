const assert=require('node:assert/strict'),fs=require('node:fs');
const codec=require('../compactscore.js'),xml=require('../compactscore-musicxml.js'),ctx=require('../compactscore-context.js');
const mapXML=require('../native-output-map-from-xml.js'),bind=require('../native-prelude-target-map.js'),writer=require('../native-prelude-writer.js');
const data=codec.decode(fs.readFileSync(__dirname+'/fixtures/native-prelude.cs','utf8'));
const converted=xml.convert(data), tree=ctx.parse(converted.xml), explicit=mapXML(data,tree);
assert.deepEqual(explicit.piano,[{sourceVoice:1,targetStaff:0,targetVoice:0},{sourceVoice:2,targetStaff:0,targetVoice:1},{sourceVoice:3,targetStaff:1,targetVoice:0}]);
// QML's QQmlListProperty is array-like, and need not be a JavaScript Array.
const score={nmeasures:4,nstaves:3,parts:{0:{startTrack:0,endTrack:4,instrumentId:'flute'},1:{startTrack:4,endTrack:12,instrumentId:'piano'},length:2}};
const job={mode:9,preludeTargets:[{indices:[1],splitPiano:false}],nativeVoiceMapping:explicit};
assert.equal(writer().prepare(score,data,bind(score,data,job)).events.length,22);
const broken=JSON.parse(JSON.stringify(tree));
const part=broken.children.find(n=>n&&n.name==='part');
const notes=part.children.filter(n=>n&&n.name==='measure').flatMap(m=>m.children.filter(n=>n&&n.name==='note'));
const staff=notes[0].children.find(n=>n&&n.name==='staff');staff.children=['2'];
assert.throws(()=>mapXML(data,broken),/Systemwechsel/);
assert.throws(()=>mapXML(data,{name:'bad',children:[]}),/MusicXML/);
console.log('Validated MusicXML-to-native mapping PASS: same hand/voice assignment for both output targets; QML list accepted; ambiguous mapping rejected');
