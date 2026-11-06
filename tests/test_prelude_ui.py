"""Qt Quick UI check for the staged 0.11.9 prelude selector.

Requires PySide6; uses repository MuseScore/FileIO QML stubs, not real MuseScore.
No API keys, network calls or paid model requests.
"""
import os
import tempfile
os.environ["QT_QPA_PLATFORM"]="offscreen"
os.environ["QT_QUICK_BACKEND"]="software"
_session=tempfile.TemporaryDirectory()
os.environ["XDG_CONFIG_HOME"]=_session.name
from pathlib import Path
from PySide6.QtGui import QGuiApplication
from PySide6.QtQuick import QQuickView,QQuickItem
from PySide6.QtCore import QUrl,QObject

root_path=Path(__file__).resolve().parent.parent
app=QGuiApplication([])
app.setOrganizationName("PreludeUITest")
app.setApplicationName("PreludeUITest")
view=QQuickView()
view.engine().addImportPath(str(root_path/"tests"/"qml-stubs"))
view.setSource(QUrl.fromLocalFile(str(root_path/"AI-Notation-Studio-App-0.11.9.qml")))
assert not view.errors(),[x.toString() for x in view.errors()]
root=view.rootObject()
assert root is not None
view.setResizeMode(QQuickView.SizeRootObjectToView)
view.resize(850,850)
view.show()
for _ in range(10):app.processEvents()
mode=root.findChild(QQuickItem,"compositionModeSelector")
assert mode is not None,"Prelude mode combo not found"
assert mode.property("count")==10,mode.property("count")
mode.setProperty("currentIndex",9)
app.processEvents()
assert mode.property("currentText")=="Vorspiel voranstellen",mode.property("currentText")
selection=[
 {"label":"Flöte (Part 1)","name":"Flöte","indices":[0],"splitPiano":False},
 {"label":"Klavier (beide Hände; Parts 3 + 4)","name":"Klavier","indices":[2,3],"splitPiano":True}
]
engine=view.engine()
engine.globalObject().setProperty("studio",engine.newQObject(root))
script='studio.preludeTargets = '+repr(selection).replace("False","false").replace("True","true")+"; studio.preludeSelectedIndices=[1];"
result=engine.evaluate(script)
assert not result.isError(),result.toString()
for _ in range(10):app.processEvents()
repeater=root.findChild(QQuickItem,"preludeTargetRepeater")
assert repeater is not None and repeater.property("count")==2
engine.globalObject().setProperty("preludeRepeater",engine.newQObject(repeater))
def qml(expression):
    result=engine.evaluate(expression)
    assert not result.isError(),result.toString()
    return result.toVariant()
assert qml("preludeRepeater.itemAt(0).text")=="Flöte (Part 1)"
assert qml("preludeRepeater.itemAt(1).text").startswith("Klavier (beide Hände")
assert not qml("preludeRepeater.itemAt(0).checked") and qml("preludeRepeater.itemAt(1).checked")
load=root.findChild(QQuickItem,"preludeLoadInstrumentsButton")
assert load is not None and not load.property("enabled"),"Load must require opened score"
mode.setProperty("currentIndex",0)
for _ in range(3):app.processEvents()
assert not qml("preludeRepeater.itemAt(0).visible") and not qml("preludeRepeater.itemAt(1).visible"),"Prelude controls leak into unrelated modes"
print("Staged 0.11.9 QML compiled; instrument selection is rendered, bound and isolated.")
view.close()
_session.cleanup()
