'use strict';
// Executes the literal onRun block from the disposable MuseScore QML probe.
// MOCK ONLY: does not claim native engine behavior.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'native_measure_insertion_probe.qml'), 'utf8');
const match = source.match(/\bonRun:\s*\{([\s\S]*)\n    \}\s*\}\s*$/);
assert(match, 'QML onRun block not found');
const body = match[1];
const helpers = source.slice(source.indexOf('    function fail('), source.indexOf('\n    onRun:'));
function run(options = {}) {
  const log=[], ops=[];
  let count=32, transaction=false, commandCount=0;
  const score={
    nstaves:4, get nmeasures(){return count},
    firstMeasure:{firstSegment:{tick:0}},
    metaTag(){return options.title===undefined ? 'ANS-TEST-Probe' : options.title},
    selection:{
      isRange:false,
      clear(){ops.push('clear');this.isRange=false},
      selectRange(a,b,c,d){ops.push('select:'+a+':'+b+':'+c+':'+d);this.isRange=true}
    },
    newCursor(){return {tick:0,rewind(){ops.push('rewind')},nextMeasure(){this.tick=1920;return true}}},
    startCmd(){assert(!transaction);transaction=true;ops.push('start')},
    endCmd(rollback){assert(transaction);transaction=false;ops.push('end:'+rollback);if(rollback&&!options.rollbackFails)count=32}
  };
  if(options.noSelection)score.selection.selectRange=undefined;
  const context={
    curScore:options.noScore ? null : score,
    Qt:{quit(){ops.push('quit')}},
    console:{log(m){log.push(m)}},
    isFinite,JSON,Number,String,Error,
    cmd(action){ops.push('cmd:'+action);commandCount++;if(options.cmdThrows)throw Error('injected command failure');if(!options.cmdNoOp)count++}
  };
  vm.runInNewContext(helpers+'\n'+body,context,{timeout:1000});
  return {log,ops,count,transaction,commandCount};
}
const cases=[
  ['rollback normal path',{},r=>{assert(r.log.some(x=>x.includes('PASS')));assert.equal(r.count,32);assert(r.ops.includes('end:true'));assert.equal(r.commandCount,1)}],
  ['ordinary score rejected',{title:'Original Symphony'},r=>{assert.equal(r.commandCount,0);assert(!r.ops.includes('start'));assert(r.log.some(x=>x.includes('Safety guard')))}],
  ['no score rejected',{noScore:true},r=>{assert.equal(r.commandCount,0);assert(r.log.some(x=>x.includes('No score')))}],
  ['missing selection API rejected',{noSelection:true},r=>{assert.equal(r.commandCount,0);assert(!r.ops.includes('start'))}],
  ['command exception rolls back',{cmdThrows:true},r=>{assert(r.ops.includes('end:true'));assert.equal(r.count,32);assert(r.log.some(x=>x.includes('injected command failure')))}],
  ['no-op command detected',{cmdNoOp:true},r=>{assert(r.ops.includes('end:true'));assert(r.log.some(x=>x.includes('postcondition failed')))}],
  ['rollback failure detected',{rollbackFails:true},r=>{assert(r.log.some(x=>x.includes('CRITICAL')));assert.equal(r.count,33);assert(!r.transaction)}]
];
for(const [name,opts,check] of cases){check(run(opts));console.log('PASS',name)}
console.log('7 mocked QML execution paths PASS; native MuseScore NOT tested');
