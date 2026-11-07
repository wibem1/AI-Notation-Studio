"""Keyboard scrolling in the real standalone Qt host, without focusing the Flickable."""
import os,sys,tempfile,shutil,json
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen'
os.environ['QT_QUICK_BACKEND']='software'
from PySide6.QtGui import QGuiApplication
from PySide6.QtQuick import QQuickView,QQuickItem
from PySide6.QtCore import QObject,Slot,QUrl,QMetaObject,Qt
from PySide6.QtTest import QTest
ROOT=Path(__file__).resolve().parents[1]
app=QGuiApplication([])
app.setOrganizationName('ArrowWindowRegression')
app.setApplicationName('ArrowWindowRegression')
class Disk(QObject):
 @Slot(str,result=str)
 def read(self,path):
  try:return Path(path).read_text(encoding='utf-8')+'\n'
  except OSError:return ''
 @Slot(str,str,result=bool)
 def write(self,path,text):
  try:Path(path).write_text(text,encoding='utf-8');return True
  except OSError:return False
backend=Disk()
with tempfile.TemporaryDirectory() as tmp:
 folder=Path(tmp)
 source=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'AI-Notation-Studio-App.qml'
 content=source.read_text(encoding='utf-8')
 import re
 version=re.search(r'version:\s*"([0-9.]+)"',content).group(1)
 starter=(ROOT/'AI-Notation-Studio.qml').read_text(encoding='utf-8').replace('0.11.1',version)
 (folder/'AI-Notation-Studio.qml').write_text(starter,encoding='utf-8')
 (folder/f'AI-Notation-Studio-App-{version}.qml').write_text(content,encoding='utf-8')
 view=QQuickView();engine=view.engine()
 engine.addImportPath(str(ROOT/'tests/qml-stubs'))
 engine.rootContext().setContextProperty('startupTestFiles',backend)
 view.setSource(QUrl.fromLocalFile(str(folder/'AI-Notation-Studio.qml')))
 assert not view.errors(),[x.toString() for x in view.errors()]
 host=view.rootObject();QMetaObject.invokeMethod(host,'run');QTest.qWait(150)
 assert host.property('hotAppActive'),host.property('startupDetails')
 window=next(w for w in app.allWindows() if w.objectName()=='notationStudioWindow')
 window.resize(700,500);window.requestActivate();QTest.qWait(100)
 studio=next(x for x in host.findChildren(QObject) if x.property('version')==version)
 scroll=studio.findChild(QQuickItem,'compositionScroll')
 # Simulate the host retaining keyboard focus instead of the loaded app.
 window.contentItem().forceActiveFocus();scroll.setProperty('contentY',0);QTest.qWait(30)
 QTest.keyClick(window,Qt.Key_Down);QTest.qWait(30)
 assert scroll.property('contentY')==48,('Host focus did not scroll',scroll.property('contentY'))
 QTest.keyClick(window,Qt.Key_Up);QTest.qWait(30);assert scroll.property('contentY')==0
 print('Standalone host content focus: Up/Down scroll without forcing app focus')
 # Ordinary buttons may retain focus after clicking an action.
 button=next(x for x in studio.findChildren(QQuickItem) if x.property('text')=='Info')
 button.forceActiveFocus();scroll.setProperty('contentY',0);QTest.keyClick(window,Qt.Key_Down);QTest.qWait(30)
 assert scroll.property('contentY')==48
 print('Button focus: Down still scrolls the main window')
 editor=next(x for x in studio.findChildren(QQuickItem) if 'TextArea' in x.metaObject().className() and not x.property('readOnly') and x.isVisible())
 editor.setProperty('text','First line\nSecond line');editor.forceActiveFocus();QTest.qWait(30)
 before=scroll.property('contentY');QTest.keyClick(window,Qt.Key_Up);QTest.qWait(30)
 assert scroll.property('contentY')==before,(window.activeFocusItem().metaObject().className(),before,scroll.property('contentY'))
 print('Text editor focus: Up remains available to the editor')
 # A read-only result is not a text editor; its focus must not trap arrows.
 result=studio.findChild(QQuickItem,'compositionAnswer')
 assert result and result.property('readOnly')
 result.setProperty('text','Generated result\\nSecond line')
 result.forceActiveFocus();scroll.setProperty('contentY',0);QTest.qWait(30)
 QTest.keyClick(window,Qt.Key_Down);QTest.qWait(30)
 assert scroll.property('contentY')==48,('Read-only result trapped Down',scroll.property('contentY'))
 QTest.keyClick(window,Qt.Key_Up);QTest.qWait(30)
 assert scroll.property('contentY')==0
 print('Read-only result focus: Up/Down scroll main window')
 # A popup must never scroll the page behind it.
 window.contentItem().forceActiveFocus()
 dialog=next(x for x in studio.findChildren(QObject) if x.property('title')=='AI Notation Studio – Info')
 QMetaObject.invokeMethod(dialog,'open');QTest.qWait(50)
 assert dialog.property('visible')
 before=scroll.property('contentY');QTest.keyClick(window,Qt.Key_Down);QTest.qWait(30)
 assert scroll.property('contentY')==before
 QMetaObject.invokeMethod(dialog,'close')
 print('Modal dialog: arrow key does not scroll the background')
 window.close();view.setSource(QUrl());QTest.qWait(30)
