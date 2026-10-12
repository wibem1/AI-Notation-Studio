"""Run the real Windows helper with large files and difficult paths, without a dialog."""
import hashlib, json, subprocess, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest().upper()
with tempfile.TemporaryDirectory(prefix='diagnostic-export-') as folder:
    base = Path(folder)
    source = base/'Source with spaces.json'
    source.write_bytes(b'{"text":"'+b'large diagnostic data '*(2*1024*1024)+b'"}')
    directory = base/'Ziel ä & $ ; Unicode'
    directory.mkdir()
    target = directory/'Diagnose ä & $ ; .json'
    receipt = base/'Receipt.json'
    expected = digest(source)
    def run(destination):
        result = subprocess.run(['powershell.exe','-NoProfile','-STA','-ExecutionPolicy','Bypass','-File',str(ROOT/'scripts/diagnostic-export.ps1'),'-Source',str(source),'-Receipt',str(receipt),'-Destination',str(destination)], capture_output=True,timeout=90)
        data = json.loads(receipt.read_text(encoding='utf-8'))
        return result.returncode, data
    for overwrite in [False, True]:
        if overwrite: target.write_text('old data')
        code, data = run(target)
        assert code == 0, data
        assert data['status'] == 'saved' and data['sha256'] == expected
        assert digest(target) == expected and data['bytes'] == source.stat().st_size
        assert not list(directory.glob('*.tmp'))
    code, data = run(base/'missing'/'diagnostic.json')
    assert code != 0 and data['status'] == 'error'
    code, data = run(source)
    assert code != 0 and data['status'] == 'error' and digest(source) == expected
    print('Large-file export (%d bytes), hashes, overwrite, Unicode/shell characters, invalid targets and source preservation OK' % source.stat().st_size)
