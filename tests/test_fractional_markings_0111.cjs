'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const qml=fs.readFileSync('AI-Notation-Studio-App-0.11.11.qml','utf8');
const standalone=require('../compactscore-musicxml.js');
const start=qml.indexOf('    function createCompactRuntime() {'),end=qml.indexOf('    // END COMPACTSCORE RUNTIME',start);
assert(start>0&&end>start);
const compact=Function(qml.slice(start,end)+';return createCompactRuntime()')();
const text='CS1\nS {"t":"Vorspiel","k":"g major","m":"4/4","b":{"v":88}}\n'+
 'P {"i":"violin","n":"violin"}\n1/1 R:w\n2/1 R:w\n'+
 'P {"i":"piano","n":"piano"}\n'+
 '1/1 R:e B4:e D5:e G5:e E5:e. D5:s C5:e B4:e\n'+
 '1/2 G2:q G3:q C3:q G3:q\n'+
 '2/1 A4:e B4:e C5:e E5:e D5:q [F#4,C5]:q\n'+
 '2/2 F#3:q A2:q D3:q D2:q\n'+
 'E {"t":"dynamic","p":{"m":1,"b":1},"v":"mp"}\n'+
 'E {"t":"hairpin","k":"crescendo","s":{"m":1,"b":3},"e":{"m":2,"b":2.5}}\n'+
 'E {"t":"pedal","s":{"m":1,"b":1},"e":{"m":1,"b":2.9}}\n'+
 'E {"t":"pedal","s":{"m":1,"b":3},"e":{"m":1,"b":4.9}}\n'+
 'E {"t":"pedal","s":{"m":2,"b":1},"e":{"m":2,"b":2.9}}\n'+
 'E {"t":"pedal","s":{"m":2,"b":3},"e":{"m":2,"b":4.9}}';
const score=compact.score.decode(text);
const out=compact.xml.convert(score);
assert.equal(out.warnings.length,0);
assert(out.xml.includes('<pedal type="stop"'));
const division=Number((out.xml.match(/<divisions>(\d+)<\/divisions>/)||[])[1]);
assert(division>0);
assert(out.xml.includes('<offset>'+Math.round(1.9*division)+'</offset>'));
assert(out.xml.includes('<offset>'+Math.round(3.9*division)+'</offset>'));
assert.equal(compact.context.inspect(out.xml,0).meters.length,2);
const old='CS1\nS {"t":"Vorspiel","k":"g major","m":"4/4"}\nP {"i":"violin","n":"violin"}\n1/1 C5:q D5:q E5:q F5:q G5:e\n';
const bad=compact.xml.convert(compact.score.decode(old)).warnings;
assert(bad.some(x=>/länger/i.test(x)),'Invalid note rhythm should still be warned about');
console.log('Fractional expressive positions round to divisions, strict note rhythm preserved');
