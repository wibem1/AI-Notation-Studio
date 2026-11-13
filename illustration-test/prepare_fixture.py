"""Small, dependency-free music engraving fixture for native MuseScore CI.
This is only a baseline test; it does not claim that an image was inserted.
"""
from pathlib import Path
import struct, zlib
root=Path(__file__).resolve().parent/'out'
root.mkdir(parents=True, exist_ok=True)
musicxml='''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE score-partwise  PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0"><work><work-title>Illustration baseline</work-title></work><movement-title>Illustration baseline</movement-title>
<identification><creator type="composer">MuseScore CI</creator></identification>
<defaults><scaling><millimeters>7</millimeters><tenths>40</tenths></scaling></defaults>
<part-list><score-part id="P1"><part-name>Piano</part-name><part-abbreviation>Pno</part-abbreviation><score-instrument id="I1"><instrument-name>Piano</instrument-name></score-instrument><midi-instrument id="I1"><midi-channel>1</midi-channel><midi-program>1</midi-program></midi-instrument></score-part></part-list>
<part id="P1"><measure implicit="no" number="1"><attributes><divisions>10080</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>
<direction placement="above"><direction-type><words>Bildtest</words></direction-type></direction>
<note default-x="79.26" default-y="-20"><pitch><step>B</step><octave>4</octave></pitch><duration>40320</duration><type>whole</type></note></measure></part></score-partwise>'''
(root/'fixture.musicxml').write_text(musicxml,encoding='utf-8')
# Generate a red 16x16 PNG with standard-library-only zlib.
raw=b''.join(bytes([0])+bytes([210,30,60])*16 for _ in range(16))
def chunk(t,data):return struct.pack('>I',len(data))+t+data+struct.pack('>I',zlib.crc32(t+data)&0xffffffff)
png=bytes.fromhex('89504e470d0a1a0a')+chunk(b'IHDR',struct.pack('>IIBBBBB',16,16,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b'')
(root/'fixture.png').write_bytes(png)
print('fixture ready')
