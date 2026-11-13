"""Check the MSCZ archive and source score existence, without assuming images."""
import sys,zipfile,xml.etree.ElementTree as ET
from pathlib import Path
p=Path(sys.argv[1])
assert p.is_file() and p.stat().st_size>1000
with zipfile.ZipFile(p) as z:
    assert z.testzip() is None
    manifest=ET.fromstring(z.read('META-INF/container.xml'))
    paths=[e.attrib['full-path'] for e in manifest.iter() if e.tag.endswith('rootfile')]
    path=next((x for x in paths if x.endswith('.mscx')), None) or next((x for x in z.namelist() if x.endswith('.mscx')), None)
    assert path, f'No .mscx score file; manifest rootfiles: {paths}'
    root=ET.fromstring(z.read(path))
    assert root.tag=='museScore',root.tag
    score=root.find('Score')
    assert score is not None and any(s.find('Measure') is not None for s in score.iter('Staff')), 'Not a populated native score'
print('Verified: native MuseScore container + MSCX XML. No image-support claim.')
