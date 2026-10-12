"""Embed the Windows helper so normal QML live updates include it."""
import json, re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
qml = root/'AI-Notation-Studio-App.qml'
helper = (root/'scripts/diagnostic-export.ps1').read_text(encoding='utf-8')
source, count = re.subn(r'^    property string diagnosticHelperScript:.*$', lambda _: '    property string diagnosticHelperScript: '+json.dumps(helper,ensure_ascii=True), qml.read_text(encoding='utf-8'), flags=re.M)
assert count == 1
qml.write_text(source,encoding='utf-8')
