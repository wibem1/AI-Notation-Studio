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
        // Deliberately narrow: a single-staff part is allowed a maximum of
        // four voices. For grand staff require a single, stable group of
        // source voice identities 1..N and map 1..4 RH / 5..8 LH.
        // Never infer a staff just from pitch or an instrument display name.
        if (staffCount !== 1 && staffCount !== 2)
            fail("Instrument mit mehr als zwei Systemen wird noch nicht unterstützt.")
        if (!voiceIds.length || voiceIds.length > staffCount*4 ||
            voiceIds.some(function(id,j){return id !== j+1}))
            fail("Quellstimmen müssen eindeutig, lückenlos und von 1 an nummeriert sein.")
        var mapping=[]
        voiceIds.forEach(function(id) {
            var staff=staffCount===1 ? 0 : Math.floor((id-1)/4)
            var voice=(id-1)%4
            if (staff>=staffCount) fail("Quellstimme ist keinem Zielsystem zugeordnet.")
            mapping.push({sourceVoice:id,targetStaff:staff,targetVoice:voice})
        })
        maps.push({sourcePart:source.id,targetPartIndex:index,voices:mapping})
    })
    return maps
}
if (typeof module !== "undefined") module.exports=nativePreludeTargetMap
