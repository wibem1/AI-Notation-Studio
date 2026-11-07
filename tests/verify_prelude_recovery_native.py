"""Compare actual MuseScore exports of the synthetic recovery integration."""
from pathlib import Path
from xml.etree import ElementTree as E
from fractions import Fraction

def load(stage):return E.parse('/tmp/recovery-'+stage+'.musicxml').getroot()
before,new,after=(load(s) for s in ('before','new','original-after'))
bp,np,ap=(r.findall('part') for r in (before,new,after))
assert len(bp)==len(np)==len(ap)==3
assert [len(p.findall('measure')) for p in np]==[34,34,34]
assert [len(p.findall('measure')) for p in bp]==[32,32,32]
assert [len(p.findall('measure')) for p in ap]==[32,32,32]

def notes(part):
    divisions=None;bars=[]
    for m in part.findall('measure'):
        divisions=m.findtext('attributes/divisions') or divisions
        assert divisions
        out=[]
        for node in m:
            if node.tag=='note':
                out.append((node.findtext('pitch/step'),node.findtext('pitch/alter') or '0',node.findtext('pitch/octave'),
                            Fraction(int(node.findtext('duration') or 0),int(divisions)),node.findtext('staff') or '1',node.findtext('voice') or '1',node.find('chord') is not None))
            elif node.tag in ('backup','forward'):
                out.append((node.tag,Fraction(int(node.findtext('duration')),int(divisions))))
        bars.append(out)
    return bars
for i in range(3):
    assert notes(bp[i])==notes(ap[i]),('original altered',i)
    assert notes(bp[i])==notes(np[i])[2:],('original music not preserved in copy',i)
assert all(n.find('pitch') is None for m in np[0].findall('measure')[:2] for n in m.findall('note'))
assert all(n.find('pitch') is None for m in np[2].findall('measure')[:2] for n in m.findall('note'))
piano=np[1].findall('measure')[:2]
assert sum(len(m.findall('note/pitch')) for m in piano)==12
assert {n.findtext('staff') for m in piano for n in m.findall('note') if n.find('pitch') is not None}=={'1','2'}
assert sum(len(m.findall('.//pedal')) for m in piano)>=2
assert sum(len(m.findall('.//wedge')) for m in piano)>=2
assert sum(len(m.findall('.//slur')) for m in piano)>=2
print('NATIVE RECOVERY PASS: 3 parts/34 bars, both piano hands and pedal/hairpin/slur retained; 32-bar original unchanged')
