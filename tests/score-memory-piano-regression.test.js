// Regression for the user-reported duplicate piano IDs and recursive metadata.
// Run: node tests/score-memory-piano-regression.test.js
const fs = require("fs"), vm = require("vm"), assert = require("assert");
const qml = fs.readFileSync("AI-Notation-Studio-App.qml", "utf8");
function section(start, end) {
  const a = qml.indexOf(start), b = qml.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, "Missing QML section: " + start);
  return qml.slice(a, b);
}
const runtimeSrc = section("function createCompactRuntime()", "// END COMPACTSCORE RUNTIME");
const runtime = vm.runInNewContext(runtimeSrc + "\ncreateCompactRuntime()").score;
const repairSrc = section("    function repairRepeatedPianoIds(", "    function acceptCompactText(");
const repair = vm.runInNewContext(repairSrc + "\nrepairRepeatedPianoIds", {
  compositionJob: { instruments: ["violin", "piano", "piano"] },
  compactWarnings: [], statusText: ""
});
const input = [
  "CS1", 'S {"t":"Test","m":"4/4"}',
  'P {"i":"violin","n":"Violine"}', "1/1 R:w",
  'P {"i":"piano","n":"Klavier (R.H.)"}', "1/1 C4:w",
  'P {"i":"piano","n":"Klavier (L.H.)"}', "1/1 C3:w"
].join("\n");
assert.throws(() => runtime.decode(input), /Doppelte Part-ID/);
const corrected = repair(input), data = runtime.decode(corrected);
assert.deepStrictEqual(Array.from(data.parts, p => p.id), ["violin","piano","piano_2"]);
assert(corrected.includes("1/1 C4:w") && corrected.includes("1/1 C3:w"));
assert.strictEqual(repair(corrected), corrected, "Correction must be idempotent");
assert.throws(() => runtime.decode(input.replace("Klavier (L.H.)", "Cello")), /Doppelte Part-ID/);
const stripSrc = section("    function stripStudioMemoryFromXml(", "    function workflowXml(");
const strip = vm.runInNewContext(stripSrc + "\nstripStudioMemoryFromXml");
const original = '<score-partwise><identification><miscellaneous><miscellaneous-field name="AI-Notation-Studio-Memory-v1">nested &lt;score-partwise&gt;</miscellaneous-field></miscellaneous></identification><part-list/></score-partwise>';
const cleaned = strip(original);
assert(!cleaned.includes("nested") && cleaned.includes("<part-list/>"));
assert.strictEqual(strip(cleaned), cleaned);
console.log("Score-memory and piano-ID regression passed.");
