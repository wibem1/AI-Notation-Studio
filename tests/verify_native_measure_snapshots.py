"""Native MuseScore 4.7.6 complex score integrity test.

Compare musical note, voice/staff, dynamics, tempo, pedal and wedge events.
Uses finalized snapshots (a writeScore during an open command is stale).
"""
from pathlib import Path
from xml.etree import ElementTree as E

def load(stage):
    p=Path("/tmp/ans-native-"+stage+".musicxml")
    assert p.is_file() and p.stat().st_size>100, ("missing native snapshot",stage)
    root=E.parse(str(p)).getroot()
    return [part.findall("measure") for part in root.findall("part")]

# Ignore renderer-generated coordinates only. They can change when a new bar is
# laid out, without altering the score's musical contents.
LAYOUT_ONLY_ATTRS = {
    "default-x", "default-y", "relative-x", "relative-y",
}

def semantic_attrs(element):
    return tuple(sorted((k, v) for k, v in element.attrib.items()
                        if k not in LAYOUT_ONLY_ATTRS))

def direction_events(element):
    direction_type = element.find("direction-type")
    if direction_type is None:
        return ()
    return tuple(sorted((node.tag, (node.text or "").strip(), semantic_attrs(node))
                        for node in direction_type.iter() if node is not direction_type))

def sig(measure):
    out=[]
    for element in measure:
        if element.tag=="note":
            out.append((
                "note",
                element.findtext("pitch/step") or ("REST" if element.find("rest") is not None else "OTHER"),
                element.findtext("pitch/alter") or "",
                element.findtext("pitch/octave") or "",
                element.findtext("duration") or "",
                element.findtext("voice") or "1",
                element.findtext("staff") or "1",
                element.findtext("type") or "",
                str(element.find("dot") is not None),
                ",".join(t.get("type","") for t in element.findall("tie")),
                ",".join(t.get("type","") for t in element.findall("notations/slur"))
            ))
        elif element.tag=="direction":
            d=element.find("direction-type")
            if d is None: continue
            out.append((
                "direction",
                element.findtext("staff") or "1",
                direction_events(element),
                tuple(sorted(element.find("sound").attrib.items())) if element.find("sound") is not None else ()
            ))
    return tuple(out)

snapshots={key:load(key) for key in ("before","rollback","committed","undo")}
expected_parts=2
assert all(len(snapshots[k])==expected_parts for k in snapshots), "lost instrument part"
expected=[4,4,5,4]
for stage,length in zip(("before","rollback","committed","undo"),expected):
    assert all(len(part)==length for part in snapshots[stage]), (stage,[len(p) for p in snapshots[stage]])

before=snapshots["before"]
assert len(set(map(repr,[sig(m) for m in before[0]])))==4, "flute fixture bars not distinct"
assert len(set(map(repr,[sig(m) for m in before[1]])))==4, "piano fixture bars not distinct"
assert any(n.findtext("voice")=="2" for m in before[1] for n in m.findall("note")), "lost piano RH voice 2 on native import"
assert any(n.findtext("staff")=="2" for m in before[1] for n in m.findall("note")), "lost piano LH staff on native import"
assert any(d.find(".//pedal") is not None for m in before[1] for d in m.findall("direction")), "lost pedal on native import"
assert any(d.find(".//wedge") is not None for m in before[1] for d in m.findall("direction")), "lost hairpin on native import"
assert any(d.find(".//metronome") is not None for m in before[0] for d in m.findall("direction")), "lost tempo on native import"

for i in range(expected_parts):
    orig=[sig(m) for m in before[i]]
    assert [sig(m) for m in snapshots["rollback"][i]]==orig, ("rollback loss",i)
    assert [sig(m) for m in snapshots["undo"][i]]==orig, ("undo loss",i)
    actual=[sig(m) for m in snapshots["committed"][i]]
    assert actual[1:]==orig, ("committed insertion changed old notes or expression",i, actual[1:],orig)
    assert all(event[0]=="note" and event[1]=="REST" for event in actual[0]), ("unexpected new-measure content",i,actual[0])

print("NATIVE COMPLEX MUSICXML INTEGRITY PASS: flute + two-staff piano, RH two voices/LH, tempo/dynamics/pedal/wedge preserved in 2..5; rollback and one-step undo restore original")
