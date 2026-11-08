// Preliminary static integration checks for the unified notation workflow.
// Run: node tests/test_notation_improve_entry.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const s = fs.readFileSync('AI-Notation-Studio-App.qml', 'utf8');
const start = s.indexOf('function notationImprove()');
const end = s.indexOf('function notationStructureApply()', start);
assert(start > 0 && end > start, 'Improvement entry point exists');
const f = s.slice(start, end);
assert.match(s, /objectName: "notationImproveButton"; text: "Notation verbessern \(Analyse starten\)"/);
assert.match(s, /onClicked: notationImprove\(\)/);
assert(f.indexOf('notationStructureSelection()') < f.indexOf('notationCheck()'));
assert(f.indexOf('notationCapture()') < f.indexOf('notationCheck()'));
assert(f.indexOf('notationStructurePrepare()') < f.indexOf('notationCheck()'));
assert.match(f, /structureStatus\.indexOf\("abgebrochen"\)/);
assert(!/notationCheck\(\)\s*\n\s*statusText\s*=/.test(f), 'Do not overwrite asynchronous AI progress or errors');
assert(!f.includes('notationStructureApply(') && !f.includes('notationApply('), 'No automatic modification');
assert.match(s, /"findings":\[\{"measure":1,"staff":1,"kind":"rhythm"/, 'Structured measure-specific findings requested');
assert.match(s, /Konkrete Notationsbefunde:/, 'Categorized findings displayed');
assert.match(s, /nicht automatisch ausgeführt/, 'Non-executable findings clearly labeled');
console.log('PASS: guarded notation improvement entry point (static checks only)');
