# AI Notation Studio v0.10.32 – 14.10.2026

Im tatsächlichen Windows-4.7.5-Protokoll werden cancel und chord-tie nicht angenommen („no one can handle the action“), auch in 0.10.31. Die konkrete Partitur erzeugt im isolierten nativen MuseScore-Test dagegen den direkten Vier-Takt-Umbau. Der Unterschied betrifft die Befehlsannahme im Plugin-Kontext.

Diese Prüffassung verwendet für beide Befehle api.engraving.cmd, die von MuseScores ExtensionBuilder.setup mit dem ursprünglich registrierten Starter verbunden wird. Bisher wurde die cmd-Methode des nachgeladenen MuseScore-App-Knotens verwendet, der kein eigenes setup durch den ExtensionBuilder erhält. Vor Mutation und pro Befehl muss die Host-Partitur dieselbe sein wie die offene App-Partitur. Die Ursache ist damit begründet eingegrenzt; eine tatsächliche Windows-Erfolgsbestätigung liegt noch nicht vor.

Geprüft: tatsächlicher QML-Bridge-Code gegen Tests für erfolgreiche Host-Weiterleitung, falschen Score, fehlende API; UI, Loader und Update/Neustart unter Qt 5. Die Notations-/Adapterregressionen bestehen unverändert. Keine Nutzerpartitur, Diagnosedatei oder privates Protokoll ist in dieser Veröffentlichung enthalten.
