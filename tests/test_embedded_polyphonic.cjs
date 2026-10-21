// Execute the actual self-contained runtime embedded in the downloadable QML.
// The external compactscore-context.js tests alone do not verify shipped code.
const fs=require('fs'), assert=require('assert');
const source=fs.readFileSync('AI-Notation-Studio-App.qml','utf8');
const begin=source.indexOf('    function createCompactRuntime() {');
const end=source.indexOf('    // END COMPACTSCORE RUNTIME',begin);
assert(begin>=0 && end>begin,'QML runtime not embedded');
const runtimeSource=source.slice(begin,end);
const runtime=Function(runtimeSource+'\nreturn createCompactRuntime();')();
assert(runtime && runtime.context && typeof runtime.context.combine==='function');
const test=fs.readFileSync('tests/test_replace_polyphonic_part.cjs','utf8');
const fakeRequire=(name)=>name==='assert'?assert:name==='../compactscore-context.js'?runtime.context:require(name);
Function('require','console',test)(fakeRequire,console);
assert(source.includes('version: "0.11.3"'),'Wrong release candidate version');
console.log('Embedded v0.11.3 polyphonic runtime matches regression behavior PASS');
