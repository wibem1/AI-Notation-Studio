"""Regression: native export comparison must detect musical corruption."""
import ast
from pathlib import Path
import unittest
from xml.etree import ElementTree as ET

source = Path(__file__).with_name("verify_native_first_note.py").read_text()
tree = ast.parse(source)
function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == "events")
namespace = {}
exec(compile(ast.Module(body=[function], type_ignores=[]), "comparator", "exec"), namespace)
events = namespace["events"]


class ComparatorTest(unittest.TestCase):
    def test_musical_differences_are_detected(self):
        samples = [
            ('<note><pitch><step>C</step><alter>1</alter><octave>5</octave></pitch></note>', '1', '-1'),
            ('<note><duration>480</duration><voice>1</voice><staff>1</staff></note>', '<voice>1', '<voice>2'),
            ('<direction><direction-type><dynamics><p/></dynamics></direction-type></direction>', '<p/>', '<f/>'),
            ('<direction><direction-type><metronome><per-minute>84</per-minute></metronome></direction-type></direction>', '84', '90'),
            ('<direction><sound tempo="84"/></direction>', '84', '90'),
            ('<direction><offset>480</offset><staff>2</staff></direction>', '<staff>2', '<staff>1'),
            ('<backup><duration>1920</duration></backup>', '1920', '960'),
            ('<note><chord/><duration>480</duration></note>', '<chord/>', ''),
        ]
        for xml, old, new in samples:
            with self.subTest(xml=xml):
                original = ET.fromstring('<measure>' + xml + '</measure>')
                changed = ET.fromstring('<measure>' + xml.replace(old, new) + '</measure>')
                self.assertNotEqual(events(original), events(changed))

    def test_only_layout_coordinates_are_ignored(self):
        first = ET.fromstring('<measure><direction default-x="10"><direction-type><words>dolce</words></direction-type></direction></measure>')
        second = ET.fromstring('<measure><direction default-x="20"><direction-type><words>dolce</words></direction-type></direction></measure>')
        self.assertEqual(events(first), events(second))
        second.find('.//words').text = 'agitato'
        self.assertNotEqual(events(first), events(second))


if __name__ == '__main__':
    unittest.main()
