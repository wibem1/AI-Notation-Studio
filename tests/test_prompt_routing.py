"""Prevent wrong expensive replacement workflow and oversized score-selection prompts."""
import json
from pathlib import Path
from PySide6.QtCore import QCoreApplication
from PySide6.QtQml import QJSEngine
qml=(Path(__file__).resolve().parents[1]/'AI-Notation-Studio-App.qml').read_text()
app=QCoreApplication([])
engine=QJSEngine()
a=qml.index('    function compactCompositionSelection(')
b=qml.index('    function compositionTask(job)',a)
result=engine.evaluate(qml[a:b]+'\ncompactCompositionSelection('+json.dumps(json.dumps({'bounds':{'startTick':0,'endTick':94080},'elements':[{'type':'Note','tick':i*480,'track':4,'pitch':'C4','durationTicks':480,'someIrrelevantLongText':'x'*500} for i in range(250)]})) + ')')
assert not result.isError(),result.toString()
compact=result.toString()
assert len(compact)<15000,len(compact)
assert '94080' in compact
assert 'someIrrelevantLongText' not in compact
assert 'C4' in compact
guard='/\\b(ersetz|neu gestalten|umgestalt|interessanter|überarbeit|verbesser|ändern|austausch|bearbeit)/i.test("Erstelle eine interessantere Klavierbegleitung")'
v=engine.evaluate(guard);assert v.toBool(),v.toString()
print('Compact context and wrong-mode request guard PASS')
