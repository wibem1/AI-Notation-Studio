# Paul Klee – native MuseScore-Layoutrendering

Dies ist ein **isolierter Gestaltungsversuch**; der Live-Plugin-Code bleibt unverändert.

## Eingabe

Die Originalpartitur als `Paul_Klee_Harmonie_der_noerdlichen_Flora.mscz` in diesem Ordner hochladen. Nicht die bereits von KI geänderten Fassungen verwenden.

Nach einem Commit im Branch `experiment/klee-layout-20261113` startet `.github/workflows/klee-score-proof.yml` automatisch. Der Workflow prüft 32 Takte und 535 Noten, exportiert die Datei mit **MuseScore Studio 4.7.6** als `klee-score.pdf`, rendert alle PDF-Seiten als `page-*.png` und stellt die Ergebnisse im GitHub-Actions-Artefakt `klee-musescore-native-layout-proof` bereit.

## Gestaltungsauftrag

Alle **22 Originaltexte** erhalten, ihre musikalischen Bezugspunkte und Bildbereiche verständlich gliedern; größere Text-/Bildrahmen, Zeilen- und Seitenwechsel nach **Sichtprüfung der MuseScore-PDF**, keine Änderungen an der Musik.

Der erste Workflow-Lauf ist nur eine Baseline. Eine finale Fassung ist erst nach optischer PDF-Kontrolle und eventueller Korrekturschleife freizugeben.
