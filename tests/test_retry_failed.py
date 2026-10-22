"""A previously failed but fully generated composition can be re-checked without another AI call."""
from pathlib import Path
from PySide6.QtCore import QCoreApplication
from PySide6.QtQml import QJSEngine
app=QCoreApplication([])
engine=QJSEngine()
src=(Path(__file__).resolve().parents[1]/'AI-Notation-Studio-App.qml').read_text()
start=src.index('    function retryFailedComposition()')
end=src.index('    function runCompositionJob(job)',start)
fn=src[start:end]
def run(js):
 v=engine.evaluate(js)
 assert not v.isError(),v.toString()
 return v
run("""var busy=false, statusText='', providerCalls=0, compositionJob={
workflowState:'invalid',raw_response:'CS1\\nS {}',validation_error:'old divisions mismatch'};
function callAI(){providerCalls++;}
function finishComposition(job,reply){
 if(reply!==job.raw_response)throw Error('reused wrong reply');
 job.workflowState='ready';
}
"""+fn+"""
retryFailedComposition();
""")
assert run("compositionJob.workflowState").toString()=="ready"
assert run("providerCalls").toInt()==0
assert "Keine neuen KI-Kosten" in run("statusText").toString()
assert 'Gespeicherte KI-Antwort erneut prüfen (kostenfrei)' in src
print("Rejected answer reused at zero new provider requests PASS")
