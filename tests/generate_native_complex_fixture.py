"""Build a disposable, musically nontrivial MuseScore native insertion fixture.

Flute + grand-staff piano; two piano voices, dynamics, tempo, pedal and
a hairpin. No user's scores or network/provider calls.
"""
from xml.etree import ElementTree as ET
from pathlib import Path

def sub(parent, name, value=None, **attrs):
    # ElementTree requires XML attribute values to be strings (Python 3.14 is strict).
    x=ET.SubElement(parent,name,{key: str(value) for key, value in attrs.items()})
    if value is not None: x.text=str(value)
    return x

def note(measure, pitch, duration, typ, voice=1, staff=None):
    n=sub(measure,"note")
    p=sub(n,"pitch")
    sub(p,"step",pitch[0])
    sub(p,"octave",pitch[1])
    sub(n,"duration",duration)
    sub(n,"voice",voice)
    sub(n,"type",typ)
    if staff is not None: sub(n,"staff",staff)
    return n

def direction(measure, *, staff=None, tempo=None, dynamics=None, pedal=None, wedge=None):
    d=sub(measure,"direction",placement="below" if pedal or wedge or dynamics else "above")
    typ=sub(d,"direction-type")
    if tempo:
        mt=sub(typ,"metronome");sub(mt,"beat-unit","quarter");sub(mt,"per-minute",tempo)
    if dynamics: sub(sub(typ,"dynamics"),dynamics)
    if pedal: sub(typ,"pedal",type=pedal,number="1",line="yes")
    if wedge: sub(typ,"wedge",type=wedge,number="1",spread="0" if wedge=="crescendo" else "15")
    if staff is not None: sub(d,"staff",staff)
    if tempo: sub(d,"sound",tempo=tempo)
    return d

root=ET.Element("score-partwise",version="4.0")
work=sub(root,"work");sub(work,"work-title","ANS-TEST-Complex")
sub(root,"movement-title","ANS-TEST-Complex")
pl=sub(root,"part-list")
for ident, name in [("P1","Flute"),("P2","Piano")]:
    p=sub(pl,"score-part",id=ident);sub(p,"part-name",name)

flute=sub(root,"part",id="P1")
piano=sub(root,"part",id="P2")
melody=["C","D","E","F"]
rh=["G","A","B","C"]
lh=["C","B","A","G"]
for i in range(1,5):
    m=sub(flute,"measure",number=str(i))
    if i==1:
        at=sub(m,"attributes")
        sub(at,"divisions",480)
        t=sub(at,"time");sub(t,"beats",4);sub(t,"beat-type",4)
        c=sub(at,"clef");sub(c,"sign","G");sub(c,"line",2)
        direction(m,tempo=84)
    direction(m,dynamics="p" if i==1 else ("f" if i==3 else "mf"))
    note(m,(melody[i-1],"5"),960,"half")
    note(m,(["G","A","B","C"][i-1],"5"),960,"half")

    m=sub(piano,"measure",number=str(i))
    if i==1:
        at=sub(m,"attributes")
        sub(at,"divisions",480);sub(at,"staves",2)
        t=sub(at,"time");sub(t,"beats",4);sub(t,"beat-type",4)
        c=sub(at,"clef",number="1");sub(c,"sign","G");sub(c,"line",2)
        c=sub(at,"clef",number="2");sub(c,"sign","F");sub(c,"line",4)
        direction(m,tempo=84,staff=1)
        direction(m,pedal="start",staff=2)
    if i==4: direction(m,pedal="stop",staff=2)
    if i==1: direction(m,wedge="crescendo",staff=1)
    if i==3: direction(m,wedge="stop",staff=1)
    direction(m,dynamics="mp" if i<3 else "f",staff=1)
    # RH voice 1: two half notes, RH voice 2: four quarters
    for pitch in [rh[i-1],melody[i-1]]:
        note(m,(pitch,"4" if pitch=="C" else "5"),960,"half",1,1)
    sub(m,"backup");m[-1].append(ET.Element("duration"));m[-1][-1].text="1920"
    for pitch in ["E","F","G","A"]:
        note(m,(pitch,"4"),480,"quarter",2,1)
    sub(m,"backup");m[-1].append(ET.Element("duration"));m[-1][-1].text="1920"
    # LH separate staff
    for pitch in [lh[i-1]]*4:
        note(m,(pitch,"3"),480,"quarter",3,2)

p=Path("/tmp/ans-test.musicxml")
p.write_bytes(ET.tostring(root,encoding="utf-8",xml_declaration=True))
assert len(flute.findall("measure"))==4
assert len(piano.findall("measure"))==4
print("Wrote complex native fixture",p,p.stat().st_size,"bytes", "parts",2,"staves",3)
