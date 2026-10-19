"""The actual shipped 0.10.33 updater installs the new app and starter; no network."""
import os,sys,tempfile,json,subprocess,shutil
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen';os.environ['QT_QUICK_BACKEND']='software'
qt5='--qt5' in sys.argv
if qt5:
 from PyQt5.QtGui import QGuiApplication
 from PyQt5.QtQuick import QQuickView
 from PyQt5.QtCore import QObject,pyqtSlot as Slot,QUrl,QMetaObject
 from PyQt5.QtTest import QTest
else:
 from PySide6.QtGui import QGuiApplication
 from PySide6.QtQuick import QQuickView
 from PySide6.QtCore import QObject,Slot,QUrl,QMetaObject
 from PySide6.QtTest import QTest
ROOT=Path(__file__).resolve().parents[1]
mode=sys.argv[sys.argv.index('--phase')+1] if '--phase' in sys.argv else 'initial'
folder=Path(sys.argv[sys.argv.index('--folder')+1]) if '--folder' in sys.argv else Path(tempfile.mkdtemp())
os.environ['XDG_CONFIG_HOME']=str(folder/'settings')
app=QGuiApplication([]);app.setOrganizationName('LegacyUpdater');app.setApplicationName('LegacyUpdater')
class Disk(QObject):
 @Slot(str,result=str)
 def read(self,path):
  try:return Path(path).read_text()+'\n'
  except OSError:return ''
 @Slot(str,str,result=bool)
 def write(self,path,text):
  try:Path(path).write_text(text);return True
  except OSError:return False
if mode=='initial':
 for old,new in [('legacy-host-0.7.25.qml','AI-Notation-Studio.qml'),('legacy-app-0.10.33.qml','AI-Notation-Studio-App-0.10.33.qml')]:
  (folder/new).write_bytes((ROOT/'tests/fixtures'/old).read_bytes())
backend=Disk();v=QQuickView();v.engine().addImportPath(str(ROOT/'tests/qml-stubs'));v.engine().rootContext().setContextProperty('startupTestFiles',backend)
v.setSource(QUrl.fromLocalFile(str(folder/'AI-Notation-Studio.qml')));assert not v.errors()
host=v.rootObject();QMetaObject.invokeMethod(host,'run');v.show();QTest.qWait(100)
def versions():return [x for x in host.findChildren(QObject) if x.property('version')]
def child(phase):
 result=subprocess.run([sys.executable,__file__,'--phase',phase,'--folder',str(folder)]+(['--qt5'] if qt5 else []),capture_output=True,text=True,timeout=30)
 assert result.returncode==0,result.stdout+'\n'+result.stderr
 print(result.stdout.strip())
if mode=='verify':
 assert any(x.property('version')=='0.11.1' for x in versions())
 assert not any(x.property('version')=='0.10.33' for x in versions())
 assert host.property('version')=='0.7.27'
 print('PASS fresh start loads updated starter 0.7.27 and app 0.11.1')
else:
 current=next(x for x in versions() if x.property('version')=='0.10.33')
 e=v.engine();e.globalObject().setProperty('current',e.newQObject(current))
 new=(ROOT/'AI-Notation-Studio-App.qml').read_text()
 value=e.evaluate('current.acceptFetchedUpdate('+json.dumps(new)+',true);current.installUpdate();')
 assert not value.isError(),value.toString();QTest.qWait(150)
 if not any(x.property('version')=='0.11.1' for x in versions()):
  assert mode=='initial' and not qt5,current.property('updateStatus')
  assert 'File name case mismatch' in current.property('updateStatus')
  assert (folder/'AI-Notation-Studio-App-0.11.1.qml').read_text()==new
  print('Legacy Qt6 directory cache: restart and repeat existing Update command once')
  child('retry')
 else:
  assert (folder/'AI-Notation-Studio.qml.backup').exists()
  assert json.loads((folder/'AI-Notation-Studio-Active.json').read_text())['version']=='0.11.1'
  print('PASS actual legacy updater installs app plus starter; originals backed up')
  child('verify')
if mode=='initial':shutil.rmtree(folder)
