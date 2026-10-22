"""Real QML + disk roundtrip: live update, cached engine reopen and fresh process restart."""
import os,sys,tempfile,json,subprocess,shutil
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen';os.environ['QT_QUICK_BACKEND']='software'
if '--qt5' in sys.argv:
 from PyQt5.QtGui import QGuiApplication
 from PyQt5.QtQuick import QQuickView
 from PyQt5.QtCore import QObject,pyqtSlot as Slot,QUrl,QMetaObject,QSettings
 from PyQt5.QtTest import QTest
else:
 from PySide6.QtGui import QGuiApplication
 from PySide6.QtQuick import QQuickView
 from PySide6.QtCore import QObject,Slot,QUrl,QMetaObject,QSettings
 from PySide6.QtTest import QTest
ROOT=Path(__file__).resolve().parents[1]
probe='--probe' in sys.argv
folder=Path(sys.argv[sys.argv.index('--probe')+1]) if probe else Path(tempfile.mkdtemp())
os.environ['XDG_CONFIG_HOME']=str(folder/'config')
app=QGuiApplication([]);app.setOrganizationName('UpdateRestartTests');app.setApplicationName('UpdateRestartTests')
class Disk(QObject):
 @Slot(str,result=str)
 def read(self,p):
  # Match MuseScore FileIO::read(): every readLine, including the final null line,
  # contributes a newline. This differs from QFile/readAll and Python read_text.
  try:return '\n'.join(Path(p).read_text().splitlines()+[''])+'\n'
  except OSError:return ''
 @Slot(str,str,result=bool)
 def write(self,p,s):
  try:Path(p).write_text(s);return True
  except OSError:return False
backend=Disk()
def create_view():
 v=QQuickView();v.engine().addImportPath(str(ROOT/'tests/qml-stubs'))
 v.engine().rootContext().setContextProperty('startupTestFiles',backend)
 return v
def open_host(v):
 v.setSource(QUrl.fromLocalFile(str(folder/'AI-Notation-Studio.qml')))
 assert not v.errors(),[x.toString() for x in v.errors()]
 host=v.rootObject();QMetaObject.invokeMethod(host,'run');v.show();QTest.qWait(100)
 assert host.property('hotAppActive'),host.property('startupDetails')
 return host
def versions(host):return [x.property('version') for x in host.findChildren(QObject) if x.property('version')]
if probe:
 v=create_view();host=open_host(v)
 assert '0.11.4' in versions(host) and '0.10.98' not in versions(host),versions(host)
 print('Fresh process loads the installed update from disk')
 sys.exit(0)
try:
 (folder/'AI-Notation-Studio.qml').write_text((ROOT/'AI-Notation-Studio.qml').read_text().replace('0.11.1','0.10.98'))
 baseline=(ROOT/'AI-Notation-Studio-App.qml').read_text().replace('0.11.4','0.10.98')
 (folder/'AI-Notation-Studio-App-0.10.98.qml').write_text(baseline)
 # Explicitly stale registry/preferences state must not control the startup version.
 settings=QSettings();settings.beginGroup('AI-Notation-Studio');settings.setValue('activeHotAppVersion','0.10.7');settings.setValue('activeHotAppSource','file:///old-app.qml');settings.sync()
 v=create_view();host=open_host(v);assert '0.10.98' in versions(host)
 record=folder/'AI-Notation-Studio-Active.json';assert json.loads(record.read_text())['version']=='0.10.98'
 current=next(x for x in host.findChildren(QObject) if x.property('version')=='0.10.98')
 assert 'nicht dauerhaft' not in current.property('updateStatus'),current.property('updateStatus')
 e=v.engine();e.globalObject().setProperty('current',e.newQObject(current))
 broken=baseline.replace('0.10.98','0.10.99').replace('import QtQuick 2.2','import MissingUpdateModule 1.0',1)
 result=e.evaluate('current.acceptFetchedUpdate('+json.dumps(broken)+',true);current.installUpdate();')
 assert not result.isError(),result.toString()
 QTest.qWait(50)
 assert 'MissingUpdateModule' in current.property('updateStatus'),current.property('updateStatus')
 assert not current.property('hotAppActive')
 assert json.loads(record.read_text())['version']=='0.10.98'
 print('Invalid QML update preserves the running app and active startup record')
 updated=(ROOT/'AI-Notation-Studio-App.qml').read_text()
 result=e.evaluate('current.acceptFetchedUpdate('+json.dumps(updated)+',true);current.installUpdate();')
 assert not result.isError(),result.toString()
 QTest.qWait(100)
 assert '0.11.4' in versions(host),(versions(host),current.property('updateStatus'))
 newest=next(x for x in host.findChildren(QObject) if x.property('version')=='0.11.4')
 assert 'nicht dauerhaft' not in newest.property('updateStatus'),newest.property('updateStatus')
 assert json.loads(record.read_text())['version']=='0.11.4'
 assert (folder/'AI-Notation-Studio-App-0.11.4.qml').read_text()==updated
 assert (folder/'AI-Notation-Studio.qml').exists() # Active record selects new app; bundled fallback may retain prior version.
 assert (folder/'AI-Notation-Studio.qml.backup').exists()
 # Destroy plugin, keep the same engine and its old compiled QML cache, then reopen.
 v.setSource(QUrl());QTest.qWait(30);host=open_host(v)
 assert '0.11.4' in versions(host) and '0.10.98' not in versions(host),versions(host)
 print('Same cached engine reopens the installed update, not the bundled older version')
 v.setSource(QUrl());QTest.qWait(30)
 child=subprocess.run([sys.executable,__file__,'--probe',str(folder)]+(['--qt5'] if '--qt5' in sys.argv else []),capture_output=True,text=True)
 assert child.returncode==0,child.stdout+'\n'+child.stderr
 print(child.stdout.strip())
 # Malformed/path-traversal records are ignored and a verified bundle stays available.
 record.write_text(json.dumps({'format':'AI-Notation-Studio-Active-1','version':'99.0.0','file':'../unexpected.qml'}))
 host=open_host(v);assert '0.10.98' in versions(host)
 print('Invalid startup record falls back to the bundled version')
finally:shutil.rmtree(folder)
