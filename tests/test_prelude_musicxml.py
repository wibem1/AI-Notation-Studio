"""Validate staged prelude MusicXML against MusicXML 4.0 XSD in Qt JavaScript."""
import json
from pathlib import Path
from lxml import etree
from PySide6.QtCore import QCoreApplication
from PySide6.QtQml import QJSEngine
ROOT=Path(__file__).resolve().parent.parent
app=QCoreApplication([])
engine=QJSEngine()
qml=(ROOT/'AI-Notation-Studio-App-0.11.9.qml').read_text()
a=qml.index('function createCompactRuntime()')
b=qml.index('    // END COMPACTSCORE RUNTIME',a)
def run(code):
    value=engine.evaluate(code)
    assert not value.isError(),value.toString()
    return value.toString()
run(qml[a:b]+'\nvar c=createCompactRuntime();')
class Resolver(etree.Resolver):
    def resolve(self,url,pubid,context):
        if url.startswith('http'):return self.resolve_filename(str(ROOT/'tests/schema'/url.split('/')[-1]),context)
parser=etree.XMLParser()
parser.resolvers.add(Resolver())
schema=etree.XMLSchema(etree.parse(str(ROOT/'tests/schema/musicxml.xsd'),parser))
original=(ROOT/'tests/fixtures/Herbstlicher-Abendgesang.cs').read_text()
prelude=('CS1\nS {"t":"Vorspiel","k":"d minor","m":"4/4","b":{"v":72}}\n'
 'P {"i":"piano","n":"piano"}\n'
 '1/1 A4:q D5:q F5:e E5:e D5:q\n'
 '1/2 D3:e A3:e F3:e A3:e D3:e A3:e F3:e A3:e\n'
 '2/1 Bb4:q. A4:e G4:h\n'
 '2/2 G2:e D3:e Bb2:e D3:e G2:e D3:e Bb2:e D3:e')
run('var base=c.xml.convert(c.score.decode('+json.dumps(original)+')).xml;')
run('var generated=c.xml.convert(c.score.decode('+json.dumps(prelude)+')).xml;')
def verify(xml,part_count):
    root=etree.fromstring(xml.encode())
    schema.assertValid(root)
    parts=root.findall('part')
    assert len(parts)==part_count
    assert all(len(part.findall('measure'))==18 for part in parts)
    for part in parts:
        assert all(measure.get('number')==str(i+1) for i,measure in enumerate(part.findall('measure')))
    return parts
run('var catalog=c.context.preludeCatalog(base);var merged=c.context.combine(base,generated,{kind:"prependPrelude",targetGroups:[catalog[0]]});')
normal=verify(json.loads(run('JSON.stringify(merged.xml)')),1)
assert len(normal[0].findall('.//note/pitch'))>0
run('var split=c.context.expandPreludeParts(base,[{splitPiano:true,indices:[0,1]}]).replace(\'<score-part id="prelude_0_2"><part-name>\',\'<score-part id="prelude_0_2"><part-name print-object="no">\');')
run('var catalog2=c.context.preludeCatalog(split);var merged2=c.context.combine(split,generated,{kind:"prependPrelude",targetGroups:[catalog2[0]]});')
split_parts=verify(json.loads(run('JSON.stringify(merged2.xml)')),2)
assert all(len(p.findall('.//note/pitch'))>0 for p in split_parts)
print('Prelude schema validation: normal and split piano (18 measures each) passed')
