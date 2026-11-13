from collections import Counter
from copy import deepcopy
from html import escape
from io import BytesIO
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET

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
tempo_texts = {}
for number in (1, 31, 32):
    tempo = measures[number - 1].find('voice/Tempo')
    old_text = tempo.find('text')
    tempo_texts[tempo.findtext('eid')] = deepcopy(old_text)
    for br in old_text.iter('br'):
        br.tail = ' ' + (br.tail or '')
    full = ' '.join(''.join(old_text.itertext()).split())
    cue, prose = full.split(' — ', 1)
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

def text_box(before, height, markup, size=11, align='left,top'):
    frame = box(before, height)
    t = child(frame, 'Text')
    child(t, 'style', 'frame')
    child(t, 'align', align)
    child(t, 'size', size)
    t.append(ET.fromstring('<text>' + markup + '</text>'))
    return frame

def image_box_at(before, path, width_mm, height_mm):
    frame = box(before, round(height_mm / 1.7 + 2.3, 3))
    im = child(frame, 'Image')
    child(im, 'autoplace', 0)
    child(im, 'offset', x=str((180 - width_mm) / 3.4), y='0')
    child(im, 'path', path)
    child(im, 'size', w=str(width_mm), h=str(height_mm))

def break_after(number, kind):
    child(child(measures[number - 1], 'LayoutBreak'), 'subtype', kind)

def format_comment(number, value):
    return '<b>T. ' + str(number) + '</b> ' + escape(value)

# Reorder simultaneous labels for a coherent reading path. Preserve their measure.
for number, order in {1:(1,0,2),6:(0,1,2,3),20:(3,0,1,2)}.items():
    comments[number] = [comments[number][i] for i in order]

text_box(1, 16, '<font size="27"/><b>Harmonie der nördlichen Flora</b><br/>'
         '<font size="13"/>Klavierstück nach dem Gemälde von Paul Klee (1927)<br/>'
         '<font size="10"/>Klavierstudie zu Paul Klee', align='center,top')
image_box_at(1, picture, 132, round(132 * 786 / 1260, 3))

# The detail views are crops of the embedded painting, keyed to the text.
from PIL import Image
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
    (1, 5, 'Obere Farbflächen', None),
    (6, 16, 'Vom Großraster zur Bildmitte', (0.04,0.23,0.96,0.58)),
    (17, 19, 'Das Mosaik im oberen Zentrum', (0.43,0.23,0.73,0.43)),
    (20, 24, 'Das weiße Zentrum und der Blick nach unten', (0.43,0.42,0.77,0.76)),
    (25, 32, 'Die untere Bildkante', (0.03,0.72,0.96,0.98)),
]
for index, (start, end, title, crop) in enumerate(sections, 1):
    if crop:
        break_after(start - 1, 'page')
        detail(start, crop, {6:110,17:86,20:84,25:120}[start])
    heading = f'<font size="10"/>TAKTE {start}–{end}<br/><font size="19"/><b>{index}. {escape(title)}</b>'
    text_box(start, 9, heading)
    rows = []
    for number in range(start, end + 1):
        if number in tempo_guides:
            rows.append('<i>' + format_comment(number, tempo_guides[number]) + '</i>')
        rows.extend(format_comment(number, value) for value in comments[number])
    text_box(start, 3.15 * len(rows) + 4, '<br/>'.join(rows))

for number in (3, 9, 12, 22, 28):
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
rendered_comments = []
for element in root.findall('Score/Staff/VBox/Text/text'):
    for marker in element.findall('b'):
        if marker.text.startswith('T. '):
            rendered_comments.append((int(marker.text[3:]), marker.tail.strip()))
assert Counter(rendered_comments) == original_comments, 'Comment text or measure changed'
for number, prose in tempo_guides.items():
    expected = format_comment(number, prose)
    assert any(expected in ET.tostring(element, encoding='unicode') for element in root.findall('Score/Staff/VBox/Text/text'))

for name, xml in ((score_file, root), ('score_style.mss', style), ('META-INF/container.xml',manifest)):
    files[name] = ET.tostring(xml, encoding='UTF-8', xml_declaration=True)
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for name, data in files.items():
        archive.writestr(name, data)
print('32 measures, 535 notes, 22 comments. Musical XML is identical after removing layout and editorial text.')
