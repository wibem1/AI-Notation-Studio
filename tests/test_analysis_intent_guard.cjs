'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const qml=fs.readFileSync('AI-Notation-Studio-App.qml','utf8');
const a=qml.indexOf('    function explicitAnalysisRequest(');
const b=qml.indexOf('    function bootstrapRun()',a);
assert(a>=0 && b>a,'Cannot locate actual dispatch functions');
const scope={
 busy:false,
 statusText:'',
 instructionBox:{text:'Analysiere die Komposititon'},
 modeBox:{currentIndex:3,currentText:'Fortsetzen'},
 calls:0,
 saveCurrentKey(){this.calls++},
 saveCurrentModel(){this.calls++},
 readSelection(){this.calls++;return true},
 runCompositionJob(){this.calls++}
};
vm.createContext(scope);
vm.runInContext(qml.slice(a,b)+'\nthis.guard=explicitAnalysisRequest;this.dispatch=sendToAI;',scope);
assert.strictEqual(scope.guard('Analysiere die Komposititon'),true);
assert.strictEqual(scope.guard('Bitte analysiere die Komposition'),true);
assert.strictEqual(scope.guard('Untersuche die Partitur'),true);
assert.strictEqual(scope.guard('Beurteile die Komposition'),true);
assert.strictEqual(scope.guard('Setze die Komposition fort'),false);
scope.dispatch();
assert(scope.statusText.includes('Modus widersprechen'));
assert(scope.statusText.includes('Analyse'));
assert(scope.statusText.includes('Kein KI-Aufruf'));
assert.strictEqual(scope.calls,0,'Mismatch must not touch paid/selection workflow');
scope.modeBox.currentIndex=2;scope.modeBox.currentText='Neues Stück';
scope.dispatch();
assert.strictEqual(scope.calls,0,'All generating modes must be blocked');
scope.modeBox.currentIndex=0;scope.modeBox.currentText='Analyse';
assert.strictEqual(scope.guard(scope.instructionBox.text),true);
console.log('0.11.15-dev analysis-intent guard: mismatch blocked before any provider call PASS');
