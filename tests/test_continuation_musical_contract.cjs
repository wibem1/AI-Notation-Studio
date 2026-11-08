// Regression: continuation must reject unrequested changes of basic key/tempo.
// No provider, MusicXML writer or MuseScore installation required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '..', 'AI-Notation-Studio-App.qml'), 'utf8');
const begin = src.indexOf('    function validateContinuationKey(');
const stop = src.indexOf('    function finishComposition(', begin);
assert(begin >= 0 && stop > begin, 'Missing musical continuation guards');
const guards = Function(src.slice(begin, stop) +
    '\nreturn {key: validateContinuationKey, tempo: validateContinuationTempo};')();
function run(name, callback, shouldReject) {
    if (shouldReject) assert.throws(callback, /Musikalische Fortsetzung abgelehnt/, name);
    else assert.doesNotThrow(callback, name);
}
const basic = {mode:3, sourceKey:{fifths:0,mode:'minor'}, sourceTempo:95, instruction:'16 Takte fortsetzen'};
run('matching minor key', () => guards.key(basic, {score:{key:'Am'}}), false);
run('relative major is different mode', () => guards.key(basic, {score:{key:'C major'}}), true);
run('different signature', () => guards.key(basic, {score:{key:'G major'}}), true);
run('missing output key', () => guards.key(basic, {score:{}}), true);
run('explicit modulation allowed', () => guards.key({...basic,instruction:'Bitte nach G-Dur modulieren'}, {score:{key:'G major'}}), false);
run('matching tempo', () => guards.tempo(basic, {score:{tempo:{bpm:95}}}), false);
run('different tempo', () => guards.tempo(basic, {score:{tempo:{bpm:120}}}), true);
run('explicit tempo change allowed', () => guards.tempo({...basic,instruction:'Tempo beschleunigen'}, {score:{tempo:{bpm:120}}}), false);
const xml = '<key><fifths>0</fifths><mode>minor</mode></key><per-minute>95</per-minute>';
const keyLine = src.split('\n').find(line => line.includes('var keyTag=source.match('));
const tempoLine = src.split('\n').find(line => line.includes('var tempoTag=source.match('));
assert(keyLine && tempoLine, 'Missing source MusicXML extraction');
const readMatch = (line) => Function('return ' + line.slice(line.indexOf('source.match(') + 13, -1))();
assert.equal(xml.match(readMatch(keyLine))[1], '0');
assert.equal(xml.match(readMatch(keyLine))[2], 'minor');
assert.equal(xml.match(readMatch(tempoLine))[1], '95');
console.log('Continuation key/tempo contract regression: PASS');
