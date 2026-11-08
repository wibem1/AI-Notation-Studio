'use strict';
// Entirely synthetic 28-bar violin + split piano score. No user music or API access.
const fs=require('fs'),cs=require('../compactscore.js'),musicxml=require('../compactscore-musicxml.js');
const counts=28;
function part(id,instrument,pitch){
  return {id,instrument,measures:Array.from({length:counts},(_,i)=>({
    number:i+1,voices:[{voice:1,events:[{type:'note',pitch,duration:'whole'}]}]
  }))};
}
const original={format:'AI-Notation-Maxi',version:'0.1',
 score:{title:'ANS-TEST-Replace-01114',key:'a minor',timeSignature:'4/4',tempo:{bpm:132,text:'Allegro'}},
 parts:[part('violin','Violine','A4'),part('piano-rh','Klavier (R.H.)','C5'),part('piano-lh','Klavier (L.H.)','A2')]};
const base=musicxml.convert(original).xml;
fs.writeFileSync('/tmp/ans-01114-base.musicxml',base);
const response=['CS1','S {"t":"ANS-TEST-Replace-01114","k":"a minor","m":"4/4"}'];
for(const [id,name,token] of [
 ['violin','Violine','G5:w'],['piano','Klavier (R.H.)','C5:w'],
 ['piano','Klavier (L.H.)','A2:w']]){
 response.push('P '+JSON.stringify({i:id,n:name}));
 for(let n=1;n<=28;n++) response.push(n+'/1 '+(name==='Klavier (L.H.)'&&n===12?'E2:q E3:q A2:q A1:h':token));
}
fs.writeFileSync('/tmp/ans-01114-request.json',JSON.stringify({raw:response.join('\n')}));
console.log('Fixture PASS: 28 bars, three one-staff parts, bad duplicate piano id + 5-beat LH bar 12');
