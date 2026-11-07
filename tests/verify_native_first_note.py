"""Independent MusicXML check for native single-note prepend spike.

Run only on exports from tests/native_first_note_probe.qml; the QML's
structural PASS is not sufficient evidence without this comparator.
"""
from pathlib import Path
from xml.etree import ElementTree as ET

def measures(stage):
    path = Path("/tmp/ans-note-" + stage + ".musicxml")
    assert path.is_file() and path.stat().st_size > 100, f"missing {stage} export"
    root = ET.parse(path).getroot()
    return [p.findall("measure") for p in root.findall("part")]

def events(measure):
    out = []
    for node in measure.iter():
        if node.tag == "note":
            out.append(("note", node.findtext("pitch/step"), node.findtext("pitch/octave"),
                        node.findtext("duration"), node.findtext("voice"), node.findtext("staff")))
        elif node.tag in ("pedal", "wedge", "metronome", "dynamics", "tie", "slur"):
            out.append((node.tag, (node.text or "").strip(),
                        tuple(sorted((key, val) for key, val in node.attrib.items()
                                     if key not in ("default-x","default-y","relative-x","relative-y")))))
    return tuple(out)

before, committed, undo = (measures(stage) for stage in ("before", "committed", "undo"))
assert len(before) == len(committed) == len(undo) == 2
assert [len(p) for p in before] == [4,4]
assert [len(p) for p in committed] == [5,5]
assert [len(p) for p in undo] == [4,4]
for part_index in (0,1):
    originals = [events(m) for m in before[part_index]]
    assert [events(m) for m in undo[part_index]] == originals, ("undo mismatch", part_index)
    assert [events(m) for m in committed[part_index][1:]] == originals, ("old score modified", part_index)
notes = committed[0][0].findall("note")
pitched = [n for n in notes if n.find("pitch") is not None]
assert len(pitched) == 1, ("one pitched note expected", len(pitched))
note = pitched[0]
assert (note.findtext("pitch/step"),note.findtext("pitch/octave"),note.findtext("type")) == ("C","5","quarter")
for part in committed:
    for measure in part[0:1]:
        assert not any(n.find("pitch") is not None for n in measure.findall("note") if n is not note), "unexpected note"
print("NATIVE SINGLE NOTE INTEGRITY PASS: original bars unchanged, C5 added, one-step undo restores originals")
