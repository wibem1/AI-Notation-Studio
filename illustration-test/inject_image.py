"""Experimental MSCZ image injection, validated by native MuseScore PDF rendering.
Do not use in production until the smoke test demonstrates a visible image.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET
import sys
import subprocess

original, picture, target = map(Path, sys.argv[1:4])
with ZipFile(original) as z:
    files = {name: z.read(name) for name in z.namelist()}
manifest = ET.fromstring(files["META-INF/container.xml"])
candidates = [x.attrib["full-path"] for x in manifest.iter() if x.tag.endswith("rootfile")]
rootfile = next((p for p in candidates if p.lower().endswith(".mscx")), None)
if rootfile is None:
    rootfile = next((p for p in files if p.lower().endswith(".mscx")), None)
if rootfile is None:
    raise SystemExit("MSCZ contains no .mscx score file")
xml = ET.fromstring(files[rootfile])
staff = next((element for element in xml.iter("Staff") if element.find("Measure") is not None), None)
if staff is None:
    raise SystemExit("No notation staff in native MuseScore XML. Root=%s, child tags=%s" % (xml.tag, [x.tag for x in xml]))
frame = ET.Element("VBox")
ET.SubElement(frame, "height").text = "55"
img = ET.SubElement(frame, "Image")
blob = picture.read_bytes()
name = subprocess.run(["openssl", "dgst", "-provider", "legacy", "-md4", "-binary"], input=blob, stdout=subprocess.PIPE, check=True).stdout.hex() + ".png"
ET.SubElement(img, "path").text = name
ET.SubElement(img, "autoScale").text = "1"
ET.SubElement(img, "size").text = "80 50"
ET.SubElement(img, "lockAspectRatio").text = "1"
staff.insert(0, frame)
files[rootfile] = ET.tostring(xml, encoding="utf-8", xml_declaration=True)
ET.SubElement(next(e for e in manifest.iter() if e.tag.endswith("rootfiles")), "file").text = "Pictures/" + name
files["META-INF/container.xml"] = ET.tostring(manifest, encoding="utf-8", xml_declaration=True)
files["Pictures/" + name] = blob
target.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(target, "w", ZIP_DEFLATED) as z:
    for name, data in files.items():
        z.writestr(name, data)
print("Image inserted as *experimental* native VBox element; awaiting MuseScore render test.")
