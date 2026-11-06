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
print("Prelude target binding:",bool(repeater),"count",repeater.property("count") if repeater else None,
      "source",root.property("preludeTargets").toVariant() if hasattr(root.property("preludeTargets"),"toVariant") else root.property("preludeTargets"),flush=True)
first=root.findChild(QQuickItem,"preludeTargetCheckbox_0")
second=root.findChild(QQuickItem,"preludeTargetCheckbox_1")
assert first is not None and second is not None, ("Instrument selectors not rendered",root.property("preludeTargets"), [(c.objectName(),c.metaObject().className()) for c in root.findChildren(QObject) if "prelude" in (c.objectName() or "").lower()])
assert first.property("text")=="Flöte (Part 1)"
assert second.property("text").startswith("Klavier (beide Hände")
assert not first.property("checked") and second.property("checked"),"Selection state not reflected"
load=root.findChild(QQuickItem,"preludeLoadInstrumentsButton")
assert load is not None and not load.property("enabled"),"Load must require opened score"
mode.setProperty("currentIndex",0)
for _ in range(3):app.processEvents()
assert not first.property("visible") and not second.property("visible"),"Prelude controls leak into unrelated modes"
print("Staged 0.11.9 QML compiled; instrument selection is rendered, bound and isolated.")
view.close()
_session.cleanup()
