const assert=require('assert'),fs=require('fs');
const app=fs.readFileSync('AI-Notation-Studio-App.qml','utf8');
assert(app.includes('Stimme ersetzen (einstimmig)'));
assert(app.includes('job.workflowKind="replaceVoice"'));
assert(app.includes('partIndex:job.replacePartIndex'));
assert(app.includes('if(staffs.length!==1)'));
assert(app.includes('Klavier ist noch gesperrt'));
assert(app.includes('startQuarter:job.startQuarter,endQuarter:job.endQuarter'));
console.log('Replace Voice UI wiring: static checks PASS');
