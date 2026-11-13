"""Insert images before numbered measures in a MuseScore 4 MSCZ score.

Example:
 python3 illustration-test/illustrate_mscz.py input.mscz output.mscz \
   1:scene1.png 13:scene2.png 25:scene3.png

Requires OpenSSL with its legacy provider (MuseScore's image store uses MD4).
Work only on a *copy* of the input file.
"""
import argparse
import subprocess
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET

def md4_name(blob, suffix):
    digest = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-md4", "-binary"],
        input=blob, stdout=subprocess.PIPE, check=True
    ).stdout
    if len(digest) != 16:
        raise ValueError("Invalid MD4 digest")
    return digest.hex() + suffix.lower()

def build(src, dst, placements):
    with ZipFile(src) as z:
        files = {name: z.read(name) for name in z.namelist()}
    mscx = next((p for p in files if p.lower().endswith(".mscx")), None)
    if not mscx:
        raise ValueError("No native MuseScore .mscx score found")
    root = ET.fromstring(files[mscx])
    score = root.find("Score")
    if score is None:
        raise ValueError("No Score node")
    staves = [s for s in score.findall("Staff") if s.findall("Measure")]
    if not staves:
        raise ValueError("No notation staves")
    staff = staves[0]
    measures = staff.findall("Measure")
    manifest = ET.fromstring(files["META-INF/container.xml"])
    rootfiles = next((e for e in manifest.iter() if e.tag.endswith("rootfiles")), None)
    if rootfiles is None:
        raise ValueError("Missing manifest rootfiles")
    for index, image_file in sorted(placements, reverse=True):
        if not 1 <= index <= len(measures):
            raise ValueError(f"Invalid measure: {index}")
        blob = image_file.read_bytes()
        name = md4_name(blob, image_file.suffix)
        archive_name = "Pictures/" + name
        files[archive_name] = blob
        if not any(e.text == archive_name for e in rootfiles.findall("file")):
            ET.SubElement(rootfiles, "file").text = archive_name
        frame = ET.Element("VBox")
        ET.SubElement(frame, "height").text = "75"
        image = ET.SubElement(frame, "Image")
        ET.SubElement(image, "path").text = name
        ET.SubElement(image, "autoScale").text = "1"
        ET.SubElement(image, "size").text = "70 95"
        ET.SubElement(image, "lockAspectRatio").text = "1"
        staff.insert(list(staff).index(measures[index - 1]), frame)
    files[mscx] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    files["META-INF/container.xml"] = ET.tostring(manifest, encoding="utf-8", xml_declaration=True)
    dst.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(dst, "w", ZIP_DEFLATED) as z:
        for name, blob in files.items():
            z.writestr(name, blob)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("placement", nargs="+", help="MEASURE:image.png")
    a = parser.parse_args()
    placements = []
    for entry in a.placement:
        measure, sep, path = entry.partition(":")
        if not sep or not measure.isdecimal():
            parser.error("Use MEASURE:image.png")
        image_file = Path(path)
        if image_file.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
            parser.error("Expected PNG/JPEG")
        if not image_file.is_file():
            parser.error(f"Image not found: {image_file}")
        placements.append((int(measure), image_file))
    if len({index for index, _ in placements}) != len(placements):
        parser.error("Each measure may have only one image")
    build(a.source, a.destination, placements)

if __name__ == "__main__":
    main()
