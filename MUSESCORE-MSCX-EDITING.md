# Manuelle MSCX-Bearbeitung in MuseScore

Stand: 15.11.2026. Gilt für direkte Änderungen an nativen MuseScore-Partituren (`.mscz` / `.mscx`), insbesondere Dynamik, Hairpins und Pedal.

## MSCX-Grundregeln für MuseScore 4.7.6

Eine `.mscz` ist ein ZIP-Container. Die eigentlichen Noten und Ausdruckszeichen stehen in der enthaltenen `.mscx`; Änderungen an dieser XML-Datei müssen die dort verwendete Version und Elementstruktur einhalten.

### Dynamikzeichen

- Ein Dynamikzeichen wie `f`, `mp` oder `ff` gehört innerhalb des passenden `<Staff><Measure><voice>` zur musikalischen Position, üblicherweise vor dem ersten Ereignis am betreffenden Einsatz.
- Ein schlichtes Zeichen hat die Struktur:

```xml
<Dynamic>
  <subtype>ff</subtype>
  <velocity>112</velocity>
  <direction>down</direction>
</Dynamic>
```

- Nicht direkt unter `<Score>` platzieren. Der Voice-Kontext bestimmt das Notensystem; bei einem Klavier ist das obere bzw. untere System entsprechend auszuwählen.

### Hairpins und Pedal

In MSCX-Version `4.70` werden Hairpins und Pedal als **lokale, gepaarte Spanner** innerhalb der Voice eines Notensystems gespeichert. Der Start enthält das eigentliche Element und einen relativen `<next><location>`-Anker. Am Ziel steht ein passender `<prev><location>`-Anker.

**Hairpin über vier Takte, Beispiel Crescendo:**

```xml
<Spanner type="HairPin">
  <HairPin>
    <subtype>0</subtype>
    <veloChange>16</veloChange>
  </HairPin>
  <next>
    <location><measures>4</measures></location>
  </next>
</Spanner>
```

Am Ziel in der passenden Voice:

```xml
<Spanner type="HairPin">
  <prev>
    <location><measures>-4</measures></location>
  </prev>
</Spanner>
```

Für Diminuendo wird der in MuseScore verwendete Diminuendo-Subtype gesetzt. Die `location`-Werte sind relativ zum jeweiligen Start- bzw. Endanker; bei untertaktigen Grenzen müssen Bruchteile ergänzt werden. Für einen halben Takt innerhalb derselben Voice ist das beispielsweise `<fractions>1/2</fractions>` am Start und `<fractions>-1/2</fractions>` am Endanker.

**Pedalabschnitt über einen halben Takt:**

```xml
<Spanner type="Pedal">
  <Pedal>
    <endHookType>1</endHookType>
    <beginText>&lt;sym&gt;keyboardPedalPed&lt;/sym&gt;</beginText>
  </Pedal>
  <next>
    <location><fractions>1/2</fractions></location>
  </next>
</Spanner>
```

Der zugehörige Endanker in derselben Voice lautet:

```xml
<Spanner type="Pedal">
  <prev>
    <location><fractions>-1/2</fractions></location>
  </prev>
</Spanner>
```

Bei einem Spanner, der an einem Taktstrich endet oder beginnt, müssen die relativen `measures`- und `fractions`-Werte gemeinsam den tatsächlichen Abstand ausdrücken. Beide Anker müssen vorhanden sein. Start und Ziel müssen im richtigen Notensystem und an echten musikalischen Zeitpunkten liegen.

**Wichtig:** Für MSCX `4.70` Hairpin- oder Pedal-Elemente nicht als alleinstehende `<HairPin>`-/`<Pedal>`-Knoten direkt unter `<Score>` einfügen. Diese globale Ablage führte in einer 48-taktigen Klavierpartitur zu einer MuseScore-Fehlermeldung; die Dynamikzeichen wurden nicht angezeigt. Nach dem Umstellen auf lokale `<Spanner>`-Anker öffnete MuseScore die Datei und zeigte Dynamik- und Pedalzeichen.

## Pflichtprüfung nach dem Eingriff

1. Original-MSCZ unangetastet sichern und das Ergebnis als separate Kopie erzeugen.
2. MSCX-XML parsen und prüfen, dass alle Spanner einen passenden Start- und Endanker besitzen, die Anker in der richtigen Voice stehen und die Takt-/Bruchteilsabstände stimmen.
3. Die Serien der musikalischen Ereignisse (`Note`, `Chord`, `Rest`) und die Taktzahl mit dem Original vergleichen. Ausdruckszeichen ergänzen, ohne unbeabsichtigt Noten, Dauern, Stimmen oder Takte zu ändern.
4. Die erzeugte MSCZ **in MuseScore Studio öffnen**. ZIP-Integrität oder wohlgeformtes XML allein genügt nicht.
5. In der nativen Partitur die tatsächliche Sichtbarkeit und Position der Dynamik, Hairpins und Pedalzeichen prüfen. Wenn die Darstellung zählt, PDF aus MuseScore exportieren und visuell kontrollieren.

## Nachgewiesener Fall

Am 15.11.2026 wurde eine Klavierpartitur mit 48 Takten, 690 Noten, 419 Akkorden und 36 Pausen bearbeitet. Die fehlerhafte Fassung speicherte Hairpin- und Pedal-Spanner auf Score-Ebene. Nach der Korrektur auf lokale Spanner-Anker öffnete die Datei in MuseScore Studio 4.7.6; Dynamik- und Pedalzeichen waren in der Partitur sichtbar. Noten-, Akkord- und Pausenzahlen blieben gleich. Ein PDF-Export fand bei dieser Korrektur nicht statt; deshalb gilt die genaue Hairpin-Darstellung im PDF weiterhin als nicht visuell bestätigt.
