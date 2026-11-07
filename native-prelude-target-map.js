// Development-only strict binding from a validated prelude job to native MuseScore
// part/staff/voice identities. This module never mutates curScore.
function nativePreludeTargetMap(score, data, job) {
    function fail(s) { throw Error("Native Vorspiel-Zuordnung: " + s) }
    if (!score || !Array.isArray(score.parts) || !data || !Array.isArray(data.parts) ||
        !job || job.mode !== 9 || !Array.isArray(job.preludeTargets))
        fail("Vorspiel, Partitur oder gespeicherte Instrumentauswahl fehlt.")
    var groups=job.preludeTargets
    if (!groups.length || groups.length !== data.parts.length)
        fail("Quellparts und ausgewählte Instrumente stimmen nicht eindeutig überein.")
    var usedTargets={},usedSource={},maps=[]
    data.parts.forEach(function(source, i) {
        if (!source || typeof source.id !== "string" || !source.id || usedSource[source.id])
            fail("Quell-Part-ID fehlt oder ist doppelt.")
        usedSource[source.id]=true
        var group=groups[i]
        if (!group || !Array.isArray(group.indices) || group.indices.length !== 1 ||
            group.splitPiano)
            fail("Geteilte Klavierparts und Gruppen mit mehreren Originalparts brauchen eigene Prüfung.")
        var index=group.indices[0]
        if (typeof index !== "number" || !isFinite(index) || index % 1 ||
            index < 0 || index >= score.parts.length || usedTargets[index])
            fail("Doppelte oder ungültige Ziel-Part-ID.")
        usedTargets[index]=true
        var target=score.parts[index]
        if (!target || typeof target.instrumentId !== "string" ||
            target.instrumentId !== source.instrument)
            fail("Instrument-ID von Original und KI-Ergebnis stimmt nicht überein.")
        var start=Number(target.startTrack),end=Number(target.endTrack)
        if (!isFinite(start) || !isFinite(end) || start % 4 || end % 4 ||
            start < 0 || end > Number(score.nstaves)*4 || end<=start)
            fail("Notensystemgrenzen des Zielparts ungültig.")
        var staffCount=(end-start)/4
        if (!Array.isArray(source.measures) || !source.measures.length)
            fail("Quellpart enthält keine Takte.")
        var voices={}
        source.measures.forEach(function(measure) {
            if (!measure || !Array.isArray(measure.voices)) fail("Stimmen fehlen.")
            measure.voices.forEach(function(v) {
                if (!v || typeof v.voice !== "number" || v.voice % 1 ||
                    v.voice < 1 || v.voice > 64) fail("Ungültige Quellstimme.")
                voices[v.voice]=true
            })
        })
        var voiceIds=Object.keys(voices).map(Number).sort(function(a,b){return a-b})
        // Crucial: voice numbers alone DO NOT encode which hand/staff a
        // pianist intended. Require a validated, explicit per-voice mapping
        // for every multi-staff part. Do not guess from pitch or display name.
        if (staffCount !== 1 && staffCount !== 2)
            fail("Instrument mit mehr als zwei Systemen wird noch nicht unterstützt.")
        var declared=job.nativeVoiceMapping && job.nativeVoiceMapping[source.id]
        if (staffCount > 1 && !Array.isArray(declared))
            fail("Für mehrsystemige Parts fehlt die explizite Stimm-/Systemzuordnung.")
        var mapping=[]
        if (Array.isArray(declared)) {
            var seen={}
            declared.forEach(function(entry) {
                if (!entry || !Number.isInteger(entry.sourceVoice) ||
                    !Number.isInteger(entry.targetStaff) || !Number.isInteger(entry.targetVoice) ||
                    !voices[entry.sourceVoice] || seen[entry.sourceVoice] ||
                    entry.targetStaff < 0 || entry.targetStaff >= staffCount ||
                    entry.targetVoice < 0 || entry.targetVoice > 3)
                    fail("Mehrdeutige oder ungültige explizite Stimmzuordnung.")
                seen[entry.sourceVoice]=true
                mapping.push({sourceVoice:entry.sourceVoice,targetStaff:entry.targetStaff,targetVoice:entry.targetVoice})
            })
            if (Object.keys(seen).length !== voiceIds.length)
                fail("Nicht alle Quellstimmen sind zugeordnet.")
        } else {
            if (!voiceIds.length || voiceIds.length>4 ||
                voiceIds.some(function(id,j){return id !== j+1}))
                fail("Quellstimmen eines Einzelstaffs sind nicht lückenlos 1..4.")
            voiceIds.forEach(function(id) {
                mapping.push({sourceVoice:id,targetStaff:0,targetVoice:id-1})
            })
        }
        var seenTracks={}
        mapping.forEach(function(entry) {
            var track=entry.targetStaff*4+entry.targetVoice
            if (seenTracks[track]) fail("Mehrere Quellstimmen teilen einen Zieltrack.")
            seenTracks[track]=true
            if (entry.targetVoice>0 && !mapping.some(function(x) {
                return x.targetStaff===entry.targetStaff && x.targetVoice===0
            })) fail("Jedes beschriebene System benötigt die Hauptstimme.")
        })
        maps.push({sourcePart:source.id,targetPartIndex:index,voices:mapping})
    })
    return maps
}
if (typeof module !== "undefined") module.exports=nativePreludeTargetMap
