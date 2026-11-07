"""Qt Quick staging check with MuseScore stubs; no native score mutation."""
import os, tempfile
os.environ["QT_QPA_PLATFORM"]="offscreen"
os.environ["QT_QUICK_BACKEND"]="software"
with tempfile.TemporaryDirectory() as temp:
    os.environ["XDG_CONFIG_HOME"]=temp
    from pathlib import Path
    from PySide6.QtGui import QGuiApplication
    from PySide6.QtQuick import QQuickView, QQuickItem
    from PySide6.QtCore import QUrl
    root_path=Path(__file__).resolve().parent.parent
    app=QGuiApplication([])
    app.setOrganizationName("ANSStaging")
    app.setApplicationName("ANSStaging")
    view=QQuickView()
    view.engine().addImportPath(str(root_path/"tests"/"qml-stubs"))
    view.setSource(QUrl.fromLocalFile(str(root_path/"tests"/"AI-Notation-Studio-App-native-output-staging.qml")))
    assert not view.errors(), [x.toString() for x in view.errors()]
    root=view.rootObject()
    assert root is not None
    view.setResizeMode(QQuickView.SizeRootObjectToView)
    view.resize(850,850)
    view.show()
    for _ in range(10): app.processEvents()
    selector=root.findChild(QQuickItem, "outputTargetSelector")
    assert selector is not None, "Output selector missing"
    assert selector.property("count")==2
    assert selector.property("currentIndex")==0, "Existing score must default"
    assert not selector.property("visible"), "Selector must not appear before output"
    root.setProperty("compositionJson",'{"format":"AI-Notation-Maxi","version":"0.1"}')
    for _ in range(10): app.processEvents()
    assert selector.property("visible"), "Valid compact result should show selector"
    assert selector.property("currentText")=="Bestehende Partitur (Standard)"
    selector.setProperty("currentIndex",1)
    assert selector.property("currentText")=="Neue Partitur"
    view.close()
print("Native output staging Qt UI PASS (MuseScore stubs only)")
