"""Check the MSCZ archive and source score existence, without assuming images."""
import sys,zipfile,xml.etree.ElementTree as ET
from pathlib import Path
p=Path(sys.argv[1])
assert p.is_file() and p.stat().st_size>1000
with zipfile.ZipFile(p) as z:
    assert z.testzip() is None
    manifest=ET.fromstring(z.read('META-INF/container.xml'))
    path=next(e.attrib['full-path'] for e in manifest.iter() if e.tag.endswith('rootfile'))
    root=ET.fromstring(z.read(path))
    assert root.tag=='museScore',root.tag
print('Verified: native MuseScore container + MSCX XML. No image-support claim.')
