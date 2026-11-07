"""Real Qt bindings: an invalid response must expose recovery controls immediately."""
import os,tempfile,json
os.environ['QT_QPA_PLATFORM']='offscreen'
os.environ['QT_QUICK_BACKEND']='software'
from pathlib import Path
from PySide6.QtGui import QGuiApplication
from PySide6.QtQuick import QQuickView,QQuickItem
from PySide6.QtCore import QUrl
ROOT=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as temp:
    os.environ['XDG_CONFIG_HOME']=temp
    app=QGuiApplication([]);app.setOrganizationName('ANSRecovery');app.setApplicationName('ANSRecovery')
    view=QQuickView();engine=view.engine();engine.addImportPath(str(ROOT/'tests/qml-stubs'))
    view.setSource(QUrl.fromLocalFile(str(ROOT/'AI-Notation-Studio-App.qml')))
    assert not view.errors(),[x.toString() for x in view.errors()]
    studio=view.rootObject();view.resize(850,850);view.show()
    engine.globalObject().setProperty('studio',engine.newQObject(studio))
    def run(js):
        result=engine.evaluate(js)
        assert not result.isError(),result.toString()
        for _ in range(5):app.processEvents()
        return result
    response='CS1\nS {"k":"g major","m":"4/4"}\nP {"i":"one","n":"piano"}\n1/1 C5:w\nP {"i":"two","n":"piano"}\n1/1 R:w\n'
    run('var calls=0;var job={id:"recovery-ui",mode:9,sourceTime:"4/4",workflowState:"draft",sourcePath:"",instruments:["piano"],strategy:0,first:{provider:"OpenAI",model:"test"},second:{provider:"OpenAI",model:"test"}};studio.compositionJob=job;')
    error=studio.findChild(QQuickItem,'compositionValidationError');retry=studio.findChild(QQuickItem,'retryStoredCompositionButton')
    assert error and retry and not error.property('visible') and not retry.property('visible')
    run('studio.finishComposition(job,'+json.dumps(response)+');')
    assert error.property('visible') and retry.property('visible'),'in-place JS job mutation did not update QML controls'
    assert 'Anzahl der Instrumente' in error.property('text')
    assert 'Nicht übernommen' in studio.property('statusText')
    run('studio.compositionJob.instruments=["piano","piano"];studio.retryFailedComposition();')
    assert run('studio.compositionJob.workflowState').toString()=='ready'
    assert not error.property('visible') and not retry.property('visible')
    assert studio.property('compositionJson')
    assert 'Keine neuen KI-Kosten' in studio.property('statusText')
    view.close()
print('Recovery UI PASS: invalid/ready transitions notify QML, visible error/retry and cost-free reuse')
