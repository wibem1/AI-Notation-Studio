"""Independent verification of three MusicXML snapshots exported by a *real* MuseScore plugin.
This intentionally checks musical events rather than unreliable MusicXML serialization whitespace.
"""
from pathlib import Path
from xml.etree import ElementTree as etree

BASE=Path("/tmp")
def load(label):
    p=BASE/("ans-native-"+label+".musicxml")
    assert p.is_file() and p.stat().st_size>100, f"missing native snapshot {p}"
    root=etree.parse(str(p)).getroot()
    parts=root.findall("part")
    assert len(parts)==1, f"{label}: unexpected part count {len(parts)}"
    return parts[0].findall("measure")

def notes(measure):
    return [(
        n.findtext("pitch/step") or ("REST" if n.find("rest") is not None else "OTHER"),
        n.findtext("pitch/alter") or "",
        n.findtext("pitch/octave") or "",
        n.findtext("duration") or "",
        n.findtext("voice") or "1",
        n.findtext("staff") or "1",
        n.findtext("type") or "",
        n.findtext("dot") or "",
        ",".join(t.get("type", "") for t in n.findall("tie"))
    ) for n in measure.findall("note")]

before, after, rollback, committed, undo = [load(k) for k in ("before","after","rollback","committed","undo")]
assert len(before)==4 and len(rollback)==4 and len(committed)==5 and len(undo)==4, (len(before),len(after),len(rollback),len(committed),len(undo))
original=[notes(m) for m in before]
assert len(set(map(repr,original)))==4, "fixture has non-distinct measures, cannot detect insertion position"
assert [notes(m) for m in rollback]==original, "rollback changed musical content"\nassert [notes(m) for m in undo]==original, "undo changed musical content"
assert [notes(m) for m in committed[1:]]==original, "committed insertion did not preserve original measure order and notes"
assert all(n[0]=="REST" for n in notes(committed[0])), "inserted measure is not empty/rest-only"
print("NATIVE MUSICXML PRESERVATION PASS: four distinct original measures shifted to 2..5 unchanged; rollback and undo restored all four")
print("Limit: one part/one staff, no tempo, pedal, tuplets or spanners in this fixture")
