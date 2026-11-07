// Development module only. Not wired into the released app.
// Strict, explicitly mapped CS1/Maxi subset: full 4/4 bars, notes/chords/rests.
function createNativePreludeWriter() {
    var DUR = {whole:1920, half:960, quarter:480, eighth:240, '16th':120, '32nd':60, '64th':30, '128th':15}
    function fail(message) { throw Error('Native Übernahme: ' + message) }
    function keys(value, allowed, where) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) fail(where + ': Objekt fehlt.')
        Object.keys(value).forEach(function(key) {
            if (allowed.indexOf(key) < 0) fail(where + ': noch nicht unterstütztes Feld ' + key)
        })
    }
    function integer(value, min, max, where) {
        if (typeof value !== 'number' || !isFinite(value) || value % 1 || value < min || value > max) fail(where)
        return value
    }
    function emptyMarks(value) {
        if (value !== undefined && (!Array.isArray(value) || value.length)) fail('Neue Ausdruckszeichen werden noch nicht übertragen; Quelle bleibt unverändert.')
    }
    function pitch(text) {
        var match = /^([A-G])(bb|##|b|#)?(-?\d+)$/.exec(text || '')
        if (!match) fail('Ungültige Tonhöhe: ' + text)
        var semitone = {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[match[1]]
        var accidental = {'':0,b:-1,bb:-2,'#':1,'##':2}[match[2] || '']
        return {midi:integer((Number(match[3])+1)*12 + semitone + accidental, 0, 127, 'Tonhöhe außerhalb MIDI-Bereich.'),
                tpc:{C:14,D:16,E:18,F:13,G:15,A:17,B:19}[match[1]] + 7*accidental}
    }
    function prepare(score, data, mappings) {
        // This entire function is read-only. Unsupported contents are never dropped.
        keys(data, ['format','version','score','parts','globalMarkings'], 'Partitur')
        if (data.format !== 'AI-Notation-Maxi' || data.version !== '0.1') fail('Maxi 0.1 wird erwartet.')
        keys(data.score, ['title','composer','key','timeSignature'], 'Kopfdaten')
        if (data.score.timeSignature !== '4/4' || data.score.key !== 'C major') fail('Dieser Entwicklungsschritt unterstützt ausschließlich 4/4 in C-Dur.')
        emptyMarks(data.globalMarkings)
        if (!Array.isArray(data.parts) || !data.parts.length || !Array.isArray(mappings) || mappings.length !== data.parts.length) fail('Explizite Partzuordnung fehlt.')
        if (!score || !score.parts || !score.nmeasures || !score.nstaves) fail('Keine Zielpartitur.')
        var events = [], count = null, usedTracks = {}, seenPartIds = {}, targetParts = {}
        var bindings = []
        data.parts.forEach(function(part) {
            keys(part, ['id','instrument','measures','markings'], 'Part')
            emptyMarks(part.markings)
            if (typeof part.id !== 'string' || !part.id || seenPartIds[part.id]) fail('Ungültige oder doppelte Part-ID.')
            seenPartIds[part.id] = true
            var map = mappings.filter(function(m) { return m.sourcePart === part.id })
            if (map.length !== 1) fail('Part-ID muss genau ein Ziel haben: ' + part.id)
            map = map[0]
            keys(map, ['sourcePart','targetPartIndex','voices'], 'Zuordnung')
            var targetIndex = integer(map.targetPartIndex, 0, score.parts.length-1, 'Zielpart fehlt.')
            if (targetParts[targetIndex]) fail('Mehrere Quellparts auf demselben Zielpart sind noch nicht unterstützt.')
            targetParts[targetIndex] = true
            var target = score.parts[targetIndex]
            if (['piano','flute'].indexOf(part.instrument) < 0 || target.instrumentId !== part.instrument) fail('Nicht unterstütztes oder abweichendes Zielinstrument.')
            var start = integer(Number(target.startTrack), 0, score.nstaves*4-1, 'Partanfang ungültig.')
            var end = integer(Number(target.endTrack), start+1, score.nstaves*4, 'Partende ungültig.')
            if (start % 4 || end % 4) fail('Partgrenzen liegen nicht auf Systemgrenzen.')
            if (!Array.isArray(map.voices) || !map.voices.length) fail('Stimmzuordnung fehlt.')
            var voiceMap = {}, voiceIds = []
            map.voices.forEach(function(v) {
                keys(v, ['sourceVoice','targetStaff','targetVoice'], 'Stimmzuordnung')
                var id = integer(v.sourceVoice, 1, 64, 'Ungültige Quellstimme.')
                var staff = start/4 + integer(v.targetStaff, 0, (end-start)/4-1, 'Zielsystem außerhalb des Parts.')
                var voice = integer(v.targetVoice, 0, 3, 'Ungültige MuseScore-Stimme.')
                var track = staff*4+voice
                if (voiceMap[id] || usedTracks[track]) fail('Doppelte Stimm-/Systemzuordnung.')
                usedTracks[track] = true
                voiceIds.push(id)
                voiceMap[id] = {staff:staff, voice:voice}
            })
            if (!Array.isArray(part.measures) || !part.measures.length) fail('Keine Takte.')
            if (count === null) count = integer(part.measures.length, 1, 64, 'Zu viele Takte.')
            if (part.measures.length !== count) fail('Unterschiedliche Taktzahlen.')
            part.measures.forEach(function(measure, index) {
                keys(measure, ['number','voices'], 'Takt')
                if (measure.number !== index+1 || !Array.isArray(measure.voices) || measure.voices.length !== voiceIds.length) fail('Takte und Stimmen müssen vollständig und fortlaufend sein.')
                var seenVoices = {}
                measure.voices.forEach(function(v) {
                    keys(v, ['voice','events'], 'Stimme')
                    var dest = voiceMap[v.voice]
                    if (!dest || seenVoices[v.voice] || !Array.isArray(v.events) || !v.events.length) fail('Stimme fehlt oder ist doppelt.')
                    seenVoices[v.voice] = true
                    var offset = 0
                    v.events.forEach(function(event) {
                        keys(event, ['type','pitch','pitches','duration','dots'], 'Notenereignis')
                        if (['note','rest','chord'].indexOf(event.type) < 0) fail('Tuplets, Vorschläge und Bögen sind noch nicht unterstützt.')
                        var duration = DUR[event.duration]
                        if (!duration) fail('Unbekannter Notenwert.')
                        var dots = event.dots === undefined ? 0 : integer(event.dots, 0, 2, 'Ungültige Punktierung.')
                        duration = duration*(2-Math.pow(0.5,dots))
                        if (duration % 1) fail('Nicht exakt darstellbarer Notenwert.')
                        var notes = []
                        if (event.type === 'note') {
                            if (event.pitches !== undefined) fail('Note mit zusätzlichem Akkordfeld.')
                            notes = [pitch(event.pitch)]
                        } else if (event.type === 'chord') {
                            if (event.pitch !== undefined || !Array.isArray(event.pitches) || !event.pitches.length) fail('Ungültiger Akkord.')
                            notes = event.pitches.map(pitch)
                        } else if (event.pitch !== undefined || event.pitches !== undefined) fail('Pause enthält Tonhöhen.')
                        var midi = {}
                        notes.forEach(function(n) { if (midi[n.midi]) fail('Doppelter Akkordton.'); midi[n.midi] = true })
                        notes.sort(function(a,b) { return a.midi-b.midi })
                        if (offset+duration > 1920) fail('Übervoller Takt.')
                        events.push({tick:index*1920+offset, duration:duration, staff:dest.staff, voice:dest.voice, notes:notes})
                        offset += duration
                    })
                    if (offset !== 1920) fail('Unvollständiger Takt. Keine automatische Auffüllung.')
                })
            })
            bindings.push({index:targetIndex,start:start,end:end,instrumentId:target.instrumentId})
        })
        // Each used staff needs voice 1 to avoid hidden host-created placeholder rests.
        Object.keys(usedTracks).forEach(function(track) {
            if (!usedTracks[Math.floor(Number(track)/4)*4]) fail('Auf jedem beschriebenen System muss die erste Stimme vorhanden sein.')
        })
        return {measures:count, events:events, bindings:bindings, originalMeasures:Number(score.nmeasures), staves:Number(score.nstaves)}
    }
    function apply(score, plan, api) {
        if (!plan || !plan.events || !plan.events.length || !api || typeof api.fractionFromTicks !== 'function' || typeof api.cmd !== 'function') fail('Ungültiger Plan oder fehlende exakte Cursor-API.')
        if (Number(score.nmeasures) !== plan.originalMeasures || Number(score.nstaves) !== plan.staves) fail('Zielpartitur wurde verändert.')
        plan.bindings.forEach(function(b) {
            var part = score.parts[b.index]
            if (!part || Number(part.startTrack) !== b.start || Number(part.endTrack) !== b.end || part.instrumentId !== b.instrumentId) fail('Zielparts wurden verändert.')
        })
        if (!score.selection || typeof score.selection.selectRange !== 'function') fail('Bereichsauswahl fehlt.')
        var check = score.newCursor()
        if (typeof check.rewindToFraction !== 'function' || typeof check.addRest !== 'function') fail('Exakte Cursorposition oder Pausen-API fehlt.')
        check.rewind(0)
        if (Number(check.tick) !== 0) fail('Auftakt oder verschobener Anfang.')
        check.nextMeasure()
        if (Number(check.tick) !== 1920) fail('Kein vollständiger 4/4-Anfangstakt.')
        function at(event) {
            var c = score.newCursor()
            c.staffIdx = event.staff
            c.voice = event.voice
            c.rewindToFraction(api.fractionFromTicks(event.tick))
            if (!c.segment || Number(c.tick) !== event.tick) fail('Exakte Einfügeposition nicht erreichbar: ' + event.tick)
            return c
        }
        function verify(event) {
            var element = at(event).element
            if (!element || !element.actualDuration || Number(element.actualDuration.ticks) !== event.duration) fail('Falscher übernommener Notenwert.')
            if (!event.notes.length) {
                if (element.name !== 'Rest') fail('Pause wurde nicht übernommen.')
            } else {
                if (element.name !== 'Chord' || element.notes.length !== event.notes.length) fail('Akkord unvollständig.')
                var actual = []
                for (var i=0; i<element.notes.length; i++) actual.push({midi:Number(element.notes[i].pitch), tpc:Number(element.notes[i].tpc1)})
                actual.sort(function(a,b) { return a.midi-b.midi })
                for (var n=0; n<actual.length; n++) if (actual[n].midi !== event.notes[n].midi || actual[n].tpc !== event.notes[n].tpc) fail('Tonhöhe oder Schreibweise stimmt nicht.')
            }
        }
        var active = false
        try {
            score.startCmd('AI Notation Studio: native Vorspieltakte')
            active = true
            for (var bar=0; bar<plan.measures; bar++) {
                score.selection.clear()
                score.selection.selectRange(0, 1920, 0, score.nstaves)
                if (!score.selection.isRange) fail('Anfangstakt nicht auswählbar.')
                api.cmd('insert-measure')
                if (Number(score.nmeasures) !== plan.originalMeasures+bar+1) fail('Takteinfügung fehlgeschlagen.')
            }
            plan.events.forEach(function(event) {
                if (!event.notes.length) {
                    var rest = at(event)
                    rest.setDuration(event.duration, 1920)
                    rest.addRest()
                } else {
                    event.notes.forEach(function(note,index) {
                        var c = at(event)
                        c.setDuration(event.duration, 1920)
                        c.addNote(note.midi, index > 0)
                    })
                    var chord = at(event).element
                    if (!chord || chord.name !== 'Chord') fail('Geschriebener Akkord fehlt.')
                    for (var n=0; n<chord.notes.length; n++) {
                        var note = chord.notes[n]
                        var expected = event.notes.filter(function(x) { return x.midi === Number(note.pitch) })
                        if (expected.length !== 1) fail('Unerwarteter Akkordton.')
                        note.tpc1 = expected[0].tpc
                        note.tpc2 = expected[0].tpc
                    }
                }
                verify(event)
            })
            plan.events.forEach(verify)
            if (Number(score.nmeasures) !== plan.originalMeasures+plan.measures || Number(score.nstaves) !== plan.staves) fail('Abschließende Strukturprüfung fehlgeschlagen.')
            score.endCmd(false)
            active = false
            return {measures:plan.measures, events:plan.events.length}
        } catch (error) {
            if (active) score.endCmd(true)
            throw error
        }
    }
    return {prepare:prepare, apply:apply}
}
if (typeof module !== 'undefined') module.exports = createNativePreludeWriter
