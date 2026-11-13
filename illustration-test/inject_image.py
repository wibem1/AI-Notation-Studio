"""Experimental MSCZ image injection, validated by native MuseScore PDF rendering.
Do not use in production until the smoke test demonstrates a visible image.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET
import sys

original, picture, target = map(Path, sys.argv[1:4])
with ZipFile(original) as z:
    files = {name: z.read(name) for name in z.namelist()}
manifest = ET.fromstring(files["META-INF/container.xml"])
rootfile = next(x.attrib["full-path"] for x in manifest.iter() if x.tag.endswith("rootfile"))
xml = ET.fromstring(files[rootfile])
staff = xml.find("./Score/Staff")
if staff is None:
    raise SystemExit("No notation staff in native MuseScore XML")
frame = ET.Element("VBox")
ET.SubElement(frame, "height").text = "55"
img = ET.SubElement(frame, "Image")
ET.SubElement(img, "path").text = "Pictures/fixture.png"
ET.SubElement(img, "autoScale").text = "1"
ET.SubElement(img, "size").text = "80 50"
ET.SubElement(img, "lockAspectRatio").text = "1"
staff.insert(0, frame)
files[rootfile] = ET.tostring(xml, encoding="utf-8", xml_declaration=True)
files["Pictures/fixture.png"] = picture.read_bytes()
target.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(target, "w", ZIP_DEFLATED) as z:
    for name, data in files.items():
        z.writestr(name, data)
print("Image inserted as *experimental* native VBox element; awaiting MuseScore render test.")
