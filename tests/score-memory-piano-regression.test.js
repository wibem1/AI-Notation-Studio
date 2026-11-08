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
const compact = vm.runInNewContext(runtimeSrc + "\ncreateCompactRuntime()");
const runtime = compact.score;
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
const converted = compact.xml.convert(data);
assert.strictEqual(converted.parts, 3);
const parsed = compact.context.parse(converted.xml);
assert.strictEqual(parsed.children.filter(x => x && x.name === "part").length, 3);
assert(converted.xml.includes("C4") === false, "MusicXML should use structured pitches");
assert.strictEqual(repair(corrected), corrected, "Correction must be idempotent");
assert.throws(() => runtime.decode(input.replace("Klavier (L.H.)", "Cello")), /Doppelte Part-ID/);
const stripSrc = section("    function stripStudioMemoryFromXml(", "    function workflowXml(");
const strip = vm.runInNewContext(stripSrc + "\nstripStudioMemoryFromXml");
const original = '<score-partwise><identification><miscellaneous><miscellaneous-field name="AI-Notation-Studio-Memory-v1">nested &lt;score-partwise&gt;</miscellaneous-field></miscellaneous></identification><part-list/></score-partwise>';
const cleaned = strip(original);
assert(!cleaned.includes("nested") && cleaned.includes("<part-list/>"));
assert.strictEqual(strip(cleaned), cleaned);
const otherMetadata = '<miscellaneous-field name="copyright">Original</miscellaneous-field>';
const twoMemories = original.replace("<part-list/>",otherMetadata +
  '<miscellaneous-field name="AI-Notation-Studio-Memory-v1">legacy</miscellaneous-field><part-list/>');
const restored = strip(twoMemories);
assert.strictEqual(restored.indexOf("AI-Notation-Studio-Memory-v1"),-1);
assert(restored.includes(otherMetadata), "Non-plugin metadata must remain intact");
const fixSrc = section("    function repairSingleTrailingPianoOverrun(", "    function finishComposition(");
const fix = vm.runInNewContext(fixSrc + "\nrepairSingleTrailingPianoOverrun");
const wholeScore = ["CS1", 'S {"t":"Regression","m":"4/4"}'];
for (const [id, instrument] of [
  ["violin", "Violine"], ["piano", "Klavier (R.H.)"], ["piano", "Klavier (L.H.)"]
]) {
  wholeScore.push("P " + JSON.stringify({i:id,n:instrument}));
  for (let bar=1;bar<=28;bar++) {
    if (instrument === "Klavier (L.H.)" && bar === 12)
      wholeScore.push("12/1 E2:q E3:q A2:q A1:h");
    else wholeScore.push(bar + "/1 R:w");
  }
}
const normalized = runtime.decode(repair(wholeScore.join("\n")));
assert.deepStrictEqual(Array.from(runtime.inspect(normalized)), [
  "piano_2 Takt 12 Stimme 1: 5 statt 4 Viertel (Auftakt/verkürzten Takt prüfen)."
]);
const repaired = fix({mode:5,workflowKind:"replace"},normalized);
assert.strictEqual(repaired.length,1);
assert.deepStrictEqual(Array.from(runtime.inspect(normalized)),[]);
assert.strictEqual(normalized.parts[2].measures[11].voices[0].events[3].duration,"quarter");
assert.strictEqual(fix({mode:5,workflowKind:"replace"},normalized).length,0);
assert.strictEqual(compact.xml.convert(normalized).measures,28);
const other = runtime.decode(repair(wholeScore.join("\n")));
assert.strictEqual(fix({mode:3,workflowKind:"append"},other).length,0);
assert.strictEqual(other.parts[2].measures[11].voices[0].events[3].duration,"half");
const normalRight = runtime.decode(repair(wholeScore.join("\n").replace("Klavier (L.H.)","Cello")));
assert.strictEqual(fix({mode:5,workflowKind:"replace"},normalRight).length,0);
const measured = runtime.decode(repair(wholeScore.join("\n")));
measured.parts[2].measures[11].voices[0].events[3].pitch="B1";
assert.strictEqual(fix({mode:5,workflowKind:"replace"},measured).length,0, "Unexpected pitches must not be edited");
console.log("Score-memory and piano-ID regression passed.");
