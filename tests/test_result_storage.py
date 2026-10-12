"""Actual QML clipboard and verified storage, including fallback and failure cases."""
import os, sys, tempfile
from pathlib import Path
os.environ['QT_QPA_PLATFORM'] = 'offscreen'
os.environ['QT_QUICK_BACKEND'] = 'software'
if '--qt5' in sys.argv:
    from PyQt5.QtGui import QGuiApplication
    from PyQt5.QtQuick import QQuickView
    from PyQt5.QtCore import QObject, QUrl, pyqtSlot as Slot
else:
    from PySide6.QtGui import QGuiApplication
    from PySide6.QtQuick import QQuickView
    from PySide6.QtCore import QObject, QUrl, Slot
ROOT = Path(__file__).resolve().parents[1]
app = QGuiApplication([])
app.setOrganizationName('ResultStorageTests')
app.setApplicationName('ResultStorageTests')
class Disk(QObject):
    def __init__(self):
        super().__init__()
        self.data = {}
        self.mode = 'ok'
    @Slot(str, result=str)
    def read(self, path):
        value = self.data.get(path, '')
        if self.mode == 'corrupt' and 'Speichertest-' in path:
            return 'wrong data'
        return value + '\n\n' if value else ''
    @Slot(str, str, result=bool)
    def write(self, path, text):
        if self.mode == 'fail' or (self.mode == 'fallback' and 'Speichertest-' in path and not path.startswith('C:/TestHome/')):
            return False
        self.data[path] = text
        return True
disk = Disk()
v = QQuickView()
v.engine().addImportPath(str(ROOT/'tests/qml-stubs'))
v.engine().rootContext().setContextProperty('startupTestFiles', disk)
v.setSource(QUrl.fromLocalFile(str(ROOT/'AI-Notation-Studio-App.qml')))
assert not v.errors(), [x.toString() for x in v.errors()]
r = v.rootObject()
e = v.engine()
e.globalObject().setProperty('studio', e.newQObject(r))
def js(code):
    result = e.evaluate(code)
    assert not result.isError(), result.toString()
    return result.toString()
button = r.findChild(QObject, 'copyResultButton')
assert button and not button.property('enabled')
sample = 'SPEICHERTEST\nUmlaute: äöü – ♫\nC:/My Plugins/Ergebnis.txt'
r.setProperty('aiAnswer', sample)
app.processEvents()
assert button.property('enabled')
js('studio.copyResult()')
assert app.clipboard().text() == sample
for mode in ['ok', 'fallback', 'fail', 'corrupt']:
    disk.data.clear()
    disk.mode = mode
    js('studio.testStoragePaths()')
    answer = r.property('aiAnswer')
    assert '\n' in answer and '\\n' not in answer
    assert '<nicht verfügbar>/' not in answer
    if mode in ['ok', 'fallback']:
        path = answer.split('Protokolldatei: ')[-1]
        assert disk.data[path] == answer
        assert 'gespeichert und nachgelesen' in r.property('statusText')
        if mode == 'fallback':
            assert path.startswith('C:/TestHome/')
    else:
        assert 'keinem geprüften Verzeichnis' in answer
        assert 'nicht gespeichert' in r.property('statusText')
    js('studio.copyResult()')
    assert app.clipboard().text() == answer
print('QML clipboard, Unicode, native read newlines, verified log, fallback and failures OK')
