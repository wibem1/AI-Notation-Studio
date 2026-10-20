// Run: node tests/test_selection_bounds.cjs
const fs = require("fs");
const assert = require("assert");
const qml = fs.readFileSync("AI-Notation-Studio-App.qml", "utf8");
function extract(name) {
    const start = qml.indexOf("    function " + name + "(");
    assert(start >= 0, name);
    const end = qml.indexOf("\n    function ", start + 1);
    return qml.slice(start, end);
}
const code = ["numericTick","elementTick","rangeSelectionBounds","selectionBounds",
    "selectionMeasureCount","scoreEndTick","measureTicks"].map(extract).join("\n");
const run = new Function("curScore","selectionJson",code +
    ";return {range:rangeSelectionBounds,bounds:selectionBounds,count:selectionMeasureCount,tick:elementTick};");
const score = {lastMeasure:{tick:{ticks:59520},ticks:{ticks:1920}}};
let api = run(score,JSON.stringify({isRange:true,bounds:{startTick:0,endTick:61440},
    elements:[{tick:0,durationTicks:480}]}));
assert.equal(api.count(),32);
assert.equal(api.range({isRange:true,startSegment:{tick:0},endSegment:null}).endTick,61440);
assert.equal(api.range({isRange:true,startSegment:{tick:{ticks:3840}},endSegment:{tick:15360}}).lengthTicks,11520);
assert.equal(api.tick({parent:{parent:{tick:{ticks:7680}}}}),7680);
assert.equal(api.tick({tick:0}),0);
api = run(score,JSON.stringify({elements:[{tick:0,durationTicks:480},{tick:59520,durationTicks:1920}]}));
assert.equal(api.count(),32);
for (const data of [{elements:[]},{isRange:true,elements:[{tick:0,durationTicks:480}]}])
    assert.throws(() => run(score,JSON.stringify(data)).count());
console.log("PASS: 8 selection bounds checks");
