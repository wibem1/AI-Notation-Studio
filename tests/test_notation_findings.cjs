// Execute the actual QML JavaScript findings renderer in an isolated VM.
// No MuseScore or chargeable provider calls; only the analysis-display slice.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('AI-Notation-Studio-App.qml', 'utf8');
const start = source.indexOf('if (Array.isArray(answer.findings) && answer.findings.length)');
const end = source.indexOf('var lines = []', start);
assert(start > 0 && end > start, 'Findings renderer exists');
const code = source.slice(start, end);
function render(findings) {
  const ctx = {answer: {findings}, notationReport: 'Analyse', curScore: {nmeasures: 32, nstaves: 2}};
  vm.runInNewContext(code, ctx, {timeout: 1000});
  return ctx.notationReport;
}
const valid = render([{measure: 24, staff: 2, kind: 'chord',
    problem: 'Akkordspanne', suggestion: 'Handverteilung prüfen'}]);
assert.match(valid, /Takt 24, System 2/);
assert.match(valid, /Akkordverteilung/);
assert.match(valid, /nicht automatisch ausgeführt/);
const invalid = render([
  {measure: 33, staff: 1, kind: 'rhythm', problem: 'Falscher Takt', suggestion: 'X'},
  {measure: 1, staff: 3, kind: 'clef', problem: 'Falsches System', suggestion: 'X'},
  {measure: 1.5, staff: 1, kind: 'rests', problem: 'Ungültiger Index', suggestion: 'X'},
  {measure: 4, staff: 1, kind: '__proto__', problem: 'Falsche Kategorie', suggestion: 'X'},
]);
assert(!invalid.includes('Falscher Takt'));
assert(!invalid.includes('Falsches System'));
assert(!invalid.includes('Ungültiger Index'));
assert(!invalid.includes('Falsche Kategorie'));
assert.equal(render(null), 'Analyse');
assert.equal(render([]), 'Analyse');
const huge = render([{measure: 1, staff: 1, kind: 'other',
    problem: 'P'.repeat(1000), suggestion: 'S'.repeat(1000)}]);
assert(!huge.includes('P'.repeat(501)));
assert(!huge.includes('S'.repeat(501)));
console.log('PASS: structured findings display and out-of-score validation');
