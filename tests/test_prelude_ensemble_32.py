"""32-measure orchestration integration: four parts, split piano, two intro bars, XSD and preservation."""
from copy import deepcopy
import os
from pathlib import Path
import json
from lxml import etree
from PySide6.QtCore import QCoreApplication
from PySide6.QtQml import QJSEngine

ROOT=Path(__file__).resolve().parents[1]
app=QCoreApplication([])
engine=QJSEngine()
qml=(ROOT/"AI-Notation-Studio-App-0.11.9.qml").read_text()
a=qml.index("function createCompactRuntime()")
b=qml.index("    // END COMPACTSCORE RUNTIME",a)
def run(expression):
    value=engine.evaluate(expression)
    assert not value.isError(),value.toString()
    return value.toString()
run(qml[a:b]+"\nvar c=createCompactRuntime();")
class Resolver(etree.Resolver):
    def resolve(self,url,pubid,context):
        if url.startswith("http"):
            return self.resolve_filename(str(ROOT/"tests/schema"/url.rsplit("/",1)[-1]),context)
parser=etree.XMLParser();parser.resolvers.add(Resolver())
schema=etree.XMLSchema(etree.parse(str(ROOT/"tests/schema/musicxml.xsd"),parser))
source=(ROOT/"tests/fixtures/Herbstlicher-Abendgesang.cs").read_text()
run("var piano=c.xml.convert(c.score.decode("+json.dumps(source)+")).xml;")
# Use the same hand split as the UI, then build a 32-measure four-part ensemble.
run('var halves=c.context.expandPreludeParts(piano,[{indices:[0,1],splitPiano:true}]);')
split=etree.fromstring(json.loads(run("JSON.stringify(halves)")).encode())
splitparts=split.findall("part")
def duplicate(part,id,name,hidden=False):
    clone=deepcopy(part)
    clone.set("id",id)
    old=clone.findall("measure")
    for m in old:
        new=deepcopy(m)
        clone.append(new)
    for j,m in enumerate(clone.findall("measure"),1):m.set("number",str(j))
    return clone
def definition(id,name,hidden=False):
    tag=etree.Element("score-part",id=id)
    title=etree.SubElement(tag,"part-name")
    title.text=name
    if hidden:title.set("print-object","no")
    return tag
root=etree.Element("score-partwise",version="4.0")
partlist=etree.SubElement(root,"part-list")
names=[("P1","Flöte",False,0),("P2","Violine",False,0),("P3","Klavier",False,0),("P4","Klavier",True,1)]
for id,name,hidden,index in names:partlist.append(definition(id,name,hidden))
for id,name,hidden,index in names:root.append(duplicate(splitparts[index],id,name,hidden))
base=etree.tostring(root,encoding="unicode")
schema.assertValid(etree.fromstring(base.encode()))
# Two complete bars; the piano CS1 body has two independent hands.
prelude=('CS1\nS {"t":"Vorspiel","k":"d minor","m":"4/4","b":{"v":72}}\n'
 'P {"i":"flute","n":"Flöte"}\n'
 '1/1 A5:h F5:h\n2/1 G5:h E5:h\n'
 'P {"i":"piano","n":"Klavier"}\n'
 '1/1 A4:q D5:q F5:e E5:e D5:q\n'
 '1/2 D3:e A3:e F3:e A3:e D3:e A3:e F3:e A3:e\n'
 '2/1 Bb4:q. A4:e G4:h\n'
 '2/2 G2:e D3:e Bb2:e D3:e G2:e D3:e Bb2:e D3:e')
run("var base="+json.dumps(base)+";")
run("var intro=c.xml.convert(c.score.decode("+json.dumps(prelude)+")).xml;")
catalog=json.loads(run("JSON.stringify(c.context.preludeCatalog(base))"))
assert len(catalog)==3,catalog
assert catalog[0]["indices"]==[0] and catalog[1]["indices"]==[1]
assert catalog[2]["indices"]==[2,3] and catalog[2]["splitPiano"]
run('var groups=c.context.preludeCatalog(base);var result=c.context.combine(base,intro,{kind:"prependPrelude",targetGroups:[groups[0],groups[2]]});')
combined=json.loads(run("JSON.stringify(result.xml)"))
out=etree.fromstring(combined.encode())
schema.assertValid(out)
original=etree.fromstring(base.encode())
oldparts=original.findall("part");newparts=out.findall("part")
assert len(oldparts)==len(newparts)==4
for i,(old,new) in enumerate(zip(oldparts,newparts)):
    before=old.findall("measure");after=new.findall("measure")
    assert len(before)==32 and len(after)==34,(i,len(after))
    for j in range(32):
        previous=deepcopy(before[j]);shifted=deepcopy(after[j+2])
        previous.attrib.pop("number",None);shifted.attrib.pop("number",None)
        assert etree.tostring(previous,method="c14n")==etree.tostring(shifted,method="c14n"),(i,j)
    assert all(m.get("number")==str(j+1) for j,m in enumerate(after))
    if i==1:
        assert all(n.find("rest") is not None for m in after[:2] for n in m.findall("note"))
    else:
        assert any(n.find("pitch") is not None for m in after[:2] for n in m.findall("note"))
assert etree.tostring(original.find("part-list"),method="c14n")==etree.tostring(out.find("part-list"),method="c14n")
output_path=os.getenv("PRELUDE_NATIVE_XML_PATH")
if output_path:
    Path(output_path).write_text(combined,encoding="utf-8")
    print("Wrote native MuseScore import fixture:",output_path)
print("Prelude 32->34 bars, flute + two-hand piano, violin rests, all source measures unchanged, XSD passed")
