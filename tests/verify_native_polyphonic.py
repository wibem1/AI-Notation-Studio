"""Independent exact oracle for the two-bar CS1 piano fixture.

Expected onsets, durations, voices and chord pitches are specified here rather
than read from the writer's plan, so a bad plan cannot validate itself.
"""
from pathlib import Path
from fractions import Fraction
from xml.etree import ElementTree as ET

def root(stage):
    path = Path('/tmp/ans-poly-'+stage+'.musicxml')
    assert path.is_file() and path.stat().st_size > 100, ('missing snapshot',stage)
    return ET.parse(path).getroot()

def semantic(node):
    return (node.tag,(node.text or '').strip(),
            tuple(sorted((k,v) for k,v in node.attrib.items()
                         if k not in ('default-x','default-y','relative-x','relative-y'))),
            tuple(semantic(child) for child in node))

def musical(measure):
    return tuple(semantic(node) for node in measure
                 if node.tag in ('note','direction','backup','forward','harmony'))

def identity(score):
    return tuple((p.get('id'),p.findtext('part-name'),p.findtext('part-abbreviation'))
                 for p in score.findall('part-list/score-part'))

before, committed, undo = (root(stage) for stage in ('before','committed','undo'))
assert identity(before) == identity(committed) == identity(undo), 'instrument identities changed'
bp,cp,up = (r.findall('part') for r in (before,committed,undo))
assert len(bp) == len(cp) == len(up) == 2
for i in range(2):
    b,c,u = (parts[i].findall('measure') for parts in (bp,cp,up))
    assert (len(b),len(c),len(u)) == (4,6,4)
    assert list(map(musical,b)) == list(map(musical,c[2:])), ('original music changed',i)
    assert list(map(musical,b)) == list(map(musical,u)), ('undo changed music',i)
assert not cp[0].findall('measure')[0].findall('note/pitch')
assert not cp[0].findall('measure')[1].findall('note/pitch')

# Keys: (staff, local voice, onset in ticks); values: duration, sorted MIDI pitches.
expected = [
    {(1,0,0):(480,(72,76,79)), (1,0,480):(240,()), (1,0,720):(240,(77,)), (1,0,960):(960,(74,77)),
     (1,1,0):(960,(67,)), (1,1,960):(480,()), (1,1,1440):(480,(69,)),
     (2,0,0):(480,(48,)), (2,0,480):(480,(43,55)), (2,0,960):(480,()), (2,0,1440):(480,(48,))},
    {(1,0,0):(720,(78,81)), (1,0,720):(240,(79,)), (1,0,960):(480,()), (1,0,1440):(480,(76,)),
     (1,1,0):(480,(69,)), (1,1,480):(480,()), (1,1,960):(960,(71,)),
     (2,0,0):(960,(41,)), (2,0,960):(240,()), (2,0,1200):(240,(48,)), (2,0,1440):(480,(53,))}
]
divisions = None
for index,measure in enumerate(cp[1].findall('measure')[:2]):
    divisions = measure.findtext('attributes/divisions') or divisions
    assert divisions, 'missing divisions'
    scale = Fraction(480,int(divisions))
    tick = 0
    chord_start = None
    actual = {}
    for node in measure:
        if node.tag in ('backup','forward'):
            tick += (1 if node.tag == 'forward' else -1)*int(node.findtext('duration'))*scale
        elif node.tag == 'note':
            assert node.find('grace') is None and node.find('tie') is None, 'unexpected grace/tie'
            duration = int(node.findtext('duration'))*scale
            chord = node.find('chord') is not None
            if not chord: chord_start = tick
            key = (int(node.findtext('staff') or 1),(int(node.findtext('voice') or 1)-1)%4,chord_start)
            p = node.find('pitch')
            midi = None
            if p is not None:
                midi = (int(p.findtext('octave'))+1)*12 + {'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}[p.findtext('step')] + int(p.findtext('alter') or 0)
            if chord:
                assert key in actual and actual[key][0] == duration and midi is not None
                actual[key] = (duration, tuple(sorted(actual[key][1]+(midi,))))
            else:
                assert key not in actual, ('duplicate event',key)
                actual[key] = (duration,() if midi is None else (midi,))
                tick += duration
    assert actual == expected[index], ('wrong new music',index,actual,expected[index])
    for (staff,voice,onset),(duration,pitches) in actual.items():
        assert onset >= 0 and onset+duration <= 1920
    if index == 1:
        sharp = [n for n in measure.findall('note') if n.findtext('pitch/step') == 'F' and n.findtext('pitch/octave') == '5']
        assert len(sharp) == 1 and sharp[0].findtext('pitch/alter') == '1', 'F# respelled or lost'
print('NATIVE POLYPHONIC INTEGRITY PASS: 2 CS1 bars, 3 piano voices, both staves, 22 exact events, chords/rests/dots/F#, originals unchanged and one-step undo')
