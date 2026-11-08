'use strict';
const fs=require('fs'),assert=require('assert'),vm=require('vm');
const src=fs.readFileSync('AI-Notation-Studio-App.qml','utf8');
const a=src.indexOf('    function repairAdjacentCompactEvents('),b=src.indexOf('    function acceptCompactText(',a);
assert(a>=0&&b>a);
const context=vm.createContext({statusText:''});
const repair=vm.runInContext(src.slice(a,b)+'\nrepairAdjacentCompactEvents',context);
const score=['CS1','S {"t":"Test","k":"a minor","m":"4/4","b":{"v":132}}',
'P {"i":"violin","n":"violin"}',
'16/1 C5:s{"i":"v16_1"}E5:sA5:sC6:s E6:e{"i":"v16_2"} A5:e F5:s{"i":"v16_3"}A5:sD6:sF6:s A6:e D6:e',
'17/1 A4:w'].join('\n');
const expected=score.replace('"}E5:sA5:sC6:s','"} E5:s A5:s C6:s').replace('"}A5:sD6:sF6:s','"} A5:s D6:s F6:s');
const result=repair(score);
assert.strictEqual(result,expected,'only separators should be inserted');
assert.strictEqual(repair(result),result,'recovery must be idempotent');
const quoted='1/1 C5:q{"x":"literal }E5:q"}D5:q';
assert.strictEqual(repair(quoted),'1/1 C5:q{"x":"literal }E5:q"} D5:q',
    'must never insert separators inside quoted JSON values');
assert.strictEqual(result.split('\n')[1],score.split('\n')[1],'score header untouched');
assert.strictEqual(result.split('\n')[2],score.split('\n')[2],'instrument definition untouched');
const compact=vm.runInContext(src.slice(src.indexOf('function createCompactRuntime()'),src.indexOf('// END COMPACTSCORE RUNTIME'))+'\ncreateCompactRuntime()',vm.createContext({}));
assert.throws(()=>compact.score.decode(score),/Zeile 4/,'original malformed score must fail');
const parsed=compact.score.decode(result);
assert.strictEqual(parsed.parts[0].measures[0].voices[0].events.length,12);
assert.strictEqual(parsed.parts[0].measures[1].voices[0].events.length,1);
const bad='CS1\nS {"k":"a minor","m":"4/4"}\nP {"i":"violin","n":"violin"}\n1/1 C5:qBROKEN';
assert.strictEqual(repair(bad),bad,'ambiguous broken input must not be repaired');
assert.throws(()=>compact.score.decode(repair(bad)));
console.log('Adjacent CS1 events recovery PASS');
