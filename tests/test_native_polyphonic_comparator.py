"""A divisions change must preserve equality without masking musical changes."""
import ast
from fractions import Fraction
from pathlib import Path
import unittest
from xml.etree import ElementTree as ET

tree = ast.parse(Path(__file__).with_name('verify_native_polyphonic.py').read_text())
functions = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in ('semantic','musical','signatures')]
namespace = {'Fraction':Fraction}
exec(compile(ast.Module(body=functions,type_ignores=[]),'native-comparator','exec'),namespace)
signatures = namespace['signatures']

def part(divisions=1, duration=1, offset=3, backup=4):
    return ET.fromstring(f'''<part><measure><attributes><divisions>{divisions}</divisions>
      <time><beats>4</beats><beat-type>4</beat-type></time>
      <clef><sign>G</sign><line>2</line></clef></attributes>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>{duration}</duration><type>quarter</type></note>
      <backup><duration>{backup}</duration></backup>
      <direction><direction-type><dynamics><p/></dynamics></direction-type><offset>{offset}</offset><sound dynamics="54.44"/></direction>
      </measure></part>''')

class NativeComparatorTest(unittest.TestCase):
    def test_unit_change_preserves_exact_music(self):
        self.assertEqual(signatures(part()),signatures(part(2,2,6,8)))

    def test_unit_normalization_does_not_hide_corruption(self):
        good = signatures(part())
        for wrong in [part(2,3,6,8),part(2,2,5,8),part(2,2,6,7)]:
            self.assertNotEqual(good,signatures(wrong))

    def test_pitch_expression_and_effective_context_remain_strict(self):
        good = signatures(part())
        for path,value in [('measure/note/pitch/step','D'),
                           ('measure/attributes/clef/sign','F'),
                           ('measure/attributes/time/beats','3')]:
            changed=part(2,2,6,8)
            changed.find(path).text=value
            self.assertNotEqual(good,signatures(changed))
        changed=part(2,2,6,8)
        changed.find('.//sound').set('dynamics','80')
        self.assertNotEqual(good,signatures(changed))

if __name__ == '__main__':
    unittest.main()
