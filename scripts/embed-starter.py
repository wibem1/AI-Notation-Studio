"""Embed the verified starter so the existing app updater also upgrades its host."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'AI-Notation-Studio-App.qml'
s=p.read_text()
a=s.index('    property string bundledStarterSource: ')
b=s.index('\n',a)
s=s[:a]+'    property string bundledStarterSource: '+json.dumps((ROOT/'AI-Notation-Studio.qml').read_text(),ensure_ascii=False)+s[b:]
p.write_text(s)
