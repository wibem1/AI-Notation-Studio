// Offline execution of the stale-AI-response guard extracted from real QML.
// No MuseScore, network, or AI provider required.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const source = fs.readFileSync('AI-Notation-Studio-App.qml','utf8');
const fnStart = source.indexOf('function notationCheck()');
const start = source.indexOf('if (!curScore || !(curScore === snapshot.score || curScore.is(snapshot.score))',fnStart);
const end = source.indexOf('var answer = JSON.parse',start);
assert(start > fnStart && end > start);
const fragment = source.slice(start,end);
const guard = new Function('curScore','snapshot','endTick','fingerprint','out',
  'var scoreEndTick=function(){return endTick};' +
  'var readSelectionForChat=function(){return fingerprint};' +
  'var notationSnapshot={},notationChanges=[1],notationPreview="old",notationReport="",statusText="";' +
  fragment +
  'out.status=statusText;out.changeCount=notationChanges.length;return out;');
const score={is:function(x){return x===this}}, other={is:function(){return false}};
function check(cur,endTick,fingerprint,expectedStale){
  const out={};
  guard(cur,{score:score,endTick:100,fingerprint:'old'},endTick,fingerprint,out);
  if(expectedStale) assert.deepEqual(out,{},'Stale response must exit early');
  else {assert.equal(out.status,'');assert.equal(out.changeCount,1);}
}
check(score,100,'old',false);
check(other,100,'old',true);
check(score,100,'new',true);
check(score,101,'old',true);
console.log('PASS: stale score, selection, duration rejected before parsing KI answer');
