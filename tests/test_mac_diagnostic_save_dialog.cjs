'use strict';
const fs=require('fs'),assert=require('assert'),vm=require('vm');
const qml=fs.readFileSync('AI-Notation-Studio-App.qml','utf8');
const a=qml.indexOf('function exportDiagnostic()'),b=qml.indexOf('function showDiagnostic()',a);
assert(a>0 && b>a);
const code=qml.slice(a,b);
const helperMatch=qml.match(/property string macDiagnosticHelperScript: ("(?:\\.|[^"\\])*")/);
assert(helperMatch,'Mac script property missing');
const helper=JSON.parse(helperMatch[1]);
assert(helper.includes('choose file name') && helper.includes('/usr/bin/cmp -s'));
function scenario(receipt) {
 const files={},started=[],c={
  diagnosticExportBusy:false,diagnosticSourcePath:'',diagnosticReceiptPath:'',
  lastDiagnosticPath:'',statusText:'',settings:{diagnosticExportDirectory:''},
  Qt:{platform:{os:'osx'},resolvedUrl:x=>'/mock/'+x},
  root:{version:'0.11.16-dev'},macDiagnosticHelperScript:helper,
  defaultDiagnosticPath:()=>'/mock/diagnostic.json',
  fileUrlToLocalPath:x=>x,
  diagnosticText:()=>JSON.stringify({diagnosticSchema:2}),
  writeVerifiedCompactFile:(p,x)=>{files[p]=String(x)},
  diagnosticExportProcess:{startWithArgs:(exe,args)=>started.push({exe,args})},
  compactFile:{source:'',read(){return files[this.source]},remove(){delete files[this.source]}}
 };
 vm.createContext(c);vm.runInContext(code+'\nthis.exportDiagnostic=exportDiagnostic;this.finishDiagnosticExport=finishDiagnosticExport;',c);
 c.exportDiagnostic();
 assert(c.diagnosticExportBusy);
 assert.equal(started.length,1);
 assert.equal(started[0].exe,'/bin/bash');
 assert.equal(started[0].args[1],'/mock/diagnostic.json');
 assert(files[started[0].args[0]].includes('choose file name'));
 files[c.diagnosticReceiptPath]=receipt;
 c.finishDiagnosticExport();
 assert(!c.diagnosticExportBusy);
 return c;
}
let c=scenario('saved\n/Users/Test/Documents/ANS-Diagnose.json\n24\n'+'a'.repeat(64)+'\n');
assert(c.statusText.includes('Diagnose gespeichert und geprüft'));
assert.equal(c.settings.diagnosticExportDirectory,'/Users/Test/Documents');
assert.equal(c.lastDiagnosticPath,'/Users/Test/Documents/ANS-Diagnose.json');
c=scenario('cancelled\n');
assert(c.statusText.includes('abgebrochen'));
c=scenario('error\nAppleScript-Speicherdialog fehlgeschlagen.\n');
assert(c.statusText.includes('fehlgeschlagen'));
console.log('macOS Save As routing, receipt verification, cancellation and errors PASS (QML mocked, not native macOS)');
