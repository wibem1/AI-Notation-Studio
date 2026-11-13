from collections import Counter
from copy import deepcopy
from html import escape, unescape
from io import BytesIO
from pathlib import Path
import re
import subprocess
import sys
import textwrap
import xml.etree.ElementTree as ET
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image

source, destination = map(Path, sys.argv[1:])
with ZipFile(source) as archive:
    assert archive.testzip() is None
    files = {name: archive.read(name) for name in archive.namelist()}

score_file = next(name for name in files if name.endswith('.mscx'))
root = ET.fromstring(files[score_file])
original = deepcopy(root)
staff = root.find('Score/Staff')
measures = staff.findall('Measure')
assert len(measures) == 32 and len(root.findall('.//Note')) == 535

# Retain every comment at its original measure in the printed reading guide.
comments = {}
for number, measure in enumerate(measures, 1):
    comments[number] = []
    for voice in measure.findall('voice'):
        for element in voice.findall('StaffText'):
            text = element.find('text')
            for br in text.iter('br'):
                br.tail = ' ' + (br.tail or '')
            comments[number].append(' '.join(''.join(text.itertext()).split()))
            voice.remove(element)
assert sum(map(len, comments.values())) == 22
original_comments = Counter((n, text) for n, group in comments.items() for text in group)

# These three tempo objects also carry prose. Keep the tempo cue and value at
# the original musical position and move its complete prose into the guide.
tempo_guides = {}
for number in (1, 31, 32):
    tempo = measures[number - 1].find('voice/Tempo')
    old_text = tempo.find('text')
    for br in old_text.iter('br'):
        br.tail = ' ' + (br.tail or '')
    full = ' '.join(''.join(old_text.itertext()).split())
    cue, prose = full.split(' — ', 1)
    assert cue == {1: 'Andante con moto, luminoso', 31: 'ritardando', 32: 'morendo'}[number]
    tempo_guides[number] = prose
    tempo.remove(old_text)
    tempo.append(ET.fromstring('<text><i>' + escape(cue) + '</i></text>'))
    if tempo.find('offset') is not None:
        tempo.remove(tempo.find('offset'))


title_frame = staff.find('VBox')
image_box = staff.find('HBox')
original_image = image_box.find('Image')
picture = original_image.findtext('path')
staff.remove(title_frame)
staff.remove(image_box)

def child(parent, tag, value=None, **attributes):
    item = ET.SubElement(parent, tag, attributes)
    item.text = None if value is None else str(value)
    return item

def box(before, height):
    frame = ET.Element('VBox')
    child(frame, 'height', height)
    child(frame, 'boxAutoSize', 0)
    staff.insert(list(staff).index(measures[before - 1]), frame)
    return frame

def text_box(before, height, markup, size=11, align='left,top', offset_x=0):
    frame = box(before, height)
    t = child(frame, 'Text')
    child(t, 'style', 'frame')
    child(t, 'align', align)
    child(t, 'size', size)
    if offset_x:
        child(t, 'offset', x=str(offset_x), y='0')
    t.append(ET.fromstring('<text>' + markup + '</text>'))
    return frame

def image_box_at(before, path, width_mm, height_mm):
    frame = box(before, round(height_mm / 1.7 + 1.2, 3))
    im = child(frame, 'Image')
    child(im, 'autoplace', 0)
    child(im, 'offset', x=str((180 - width_mm) / 3.4), y='0')
    child(im, 'path', path)
    child(im, 'size', w=str(width_mm / 1.7), h=str(height_mm / 1.7))
    return frame

def break_after(number, kind):
    child(child(measures[number - 1], 'LayoutBreak'), 'subtype', kind)

def format_comment(number, value):
    return '<b>T. ' + str(number) + '</b> ' + escape(value)

# Reorder simultaneous labels for a coherent reading path. Preserve their measure.
for number, order in {1:(1,0,2),6:(0,1,2,3),20:(3,0,1,2)}.items():
    comments[number] = [comments[number][i] for i in order]

box(1, 15)
text_box(1, 16, '<font size="24"/><b>Harmonie der nördlichen Flora</b><br/>'
         '<font size="13"/>Klavierstück nach einem Gemälde von Paul Klee', align='center,top', offset_x=12.4)
image_box_at(1, picture, 160, round(160 * 786 / 1260, 3))
caption = text_box(1, 11, '<font size="11"/><i>Paul Klee · Harmonie der nördlichen Flora · 1927</i>',
                   align='center,top')
child(child(caption, 'LayoutBreak'), 'subtype', 'page')

# The detail views are crops of the embedded painting, keyed to the text.
painting = Image.open(BytesIO(files['Pictures/' + picture]))
manifest = ET.fromstring(files['META-INF/container.xml'])
def detail(before, bounds, width):
    crop = painting.crop(tuple(round(value * side) for value, side in zip(bounds, painting.size * 2)))
    buffer = BytesIO()
    crop.save(buffer, format='PNG')
    data = buffer.getvalue()
    digest = subprocess.check_output(['openssl', 'dgst', '-provider', 'legacy', '-md4', '-r'], input=data).decode().split()[0]
    path = digest + '.png'
    files['Pictures/' + path] = data
    child(manifest.find('rootfiles'), 'rootfile', **{'full-path':'Pictures/' + path})
    image_box_at(before, path, width, round(width * crop.height / crop.width, 3))

sections = [
    (1, 5, 'Vom linken Rand zur oberen Bildreihe', (0.005,0.005,0.995,0.24),
     'Mein Blick hält sich erst am dunklen Rand fest. Dann wandert er über Rot und Blau zum Gelb.'),
    (6, 16, 'Vom Großraster zur Bildmitte', (0.04,0.23,0.96,0.58),
     'Ich folge den schwarzen Linien. Je näher ich der Mitte komme, desto häufiger teilen sie die Farbflächen.'),
    (17, 19, 'Das Mosaik im oberen Zentrum', (0.43,0.23,0.73,0.43),
     'Jetzt springt mein Blick von Zelle zu Zelle. Die Farben flirren.'),
    (20, 24, 'Das weiße Zentrum und der Blick nach unten', (0.43,0.42,0.77,0.76),
     'Am weißen Feld halte ich inne. Von dort zieht das Grün meinen Blick weiter nach unten.'),
    (25, 32, 'Die untere Bildkante', (0.005,0.72,0.995,0.995),
     'Unten werden die Felder wieder groß. Am rechten Rand kehrt die Ruhe des Anfangs zurück.'),
]
for index, (start, end, title, crop, thought) in enumerate(sections, 1):
    if start > 1:
        break_after(start - 1, 'page')
    detail(start, crop, {1:138,6:122,17:116,20:96,25:138}[start])
    heading = f'<font size="10"/>TAKTE {start}–{end}<br/><font size="19"/><b>{index}. {escape(title)}</b>'
    text_box(start, 7, heading)
    thought_lines = textwrap.wrap(thought, width=89)
    text_box(start, 2.85 * len(thought_lines) + 1,
             '<i>' + '<br/>'.join(map(escape, thought_lines)) + '</i>')
    rows = []
    line_count = 0
    for number in range(start, end + 1):
        entries = ([(tempo_guides[number], True)] if number in tempo_guides else [])
        entries.extend((value, False) for value in comments[number])
        for value, from_tempo in entries:
            lines = textwrap.wrap(value, width=86, break_long_words=False, break_on_hyphens=False)
            markup = format_comment(number, lines[0])
            for line in lines[1:]:
                markup += '<br/>     ' + escape(line)
            if from_tempo:
                markup = '<i>' + markup + '</i>'
            rows.append(markup)
            line_count += len(lines)
    text_box(start, 2.65 * line_count + 1.4, '<br/>'.join(rows))

for number in (9, 12, 22, 28):
    break_after(number, 'line')

style = ET.fromstring(files['score_style.mss'])
style.find('Style/enableVerticalSpread').text = '0'
style.find('Style/maxSystemDistance').text = '11'
style.find('Style/systemFrameDistance').text = '2'
style.find('Style/frameSystemDistance').text = '5'

def stripped(document):
    copy = deepcopy(document)
    for parent in copy.iter():
        for item in list(parent):
            if item.tag in ('VBox', 'HBox', 'LayoutBreak', 'StaffText'):
                parent.remove(item)
            if item.tag == 'Tempo':
                for tag in ('text', 'offset'):
                    value = item.find(tag)
                    if value is not None:
                        item.remove(value)

    return ET.canonicalize(ET.tostring(copy, encoding='unicode'), strip_text=True)

assert stripped(original) == stripped(root), 'Musical markup changed'
rendered_comments = Counter()
for element in root.findall('Score/Staff/VBox/Text/text'):
    # The markup can contain a line break inside one comment. Recombine
    # continuation lines before comparing with the source text.
    markup = ET.tostring(element, encoding='unicode')
    entries = re.split(r'<b>T\. (\d+)</b>', markup)
    for number, content in zip(entries[1::2], entries[2::2]):
        value = ' '.join(unescape(re.sub(r'<[^>]+>', ' ', content)).split())
        rendered_comments[int(number), value] += 1
assert rendered_comments == original_comments + Counter(tempo_guides.items())
for name, xml in ((score_file, root), ('score_style.mss', style), ('META-INF/container.xml',manifest)):
    files[name] = ET.tostring(xml, encoding='UTF-8', xml_declaration=True)
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for name, data in files.items():
        archive.writestr(name, data)
print('32 measures, 535 notes, 22 comments. Musical XML is identical after removing layout and editorial text.')
