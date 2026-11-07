// Bind native voices to the staff assignments in the SAME validated MusicXML
// used by the alternative output target. No new pitch/name/hand heuristic.
function nativeVoiceMappingFromMusicXML(data, tree) {
    function children(node, name) {
        return (node.children || []).filter(function(n) { return n && typeof n !== 'string' && n.name === name })
    }
    function text(node, name) {
        var found = children(node,name)
        return found.length === 1 ? found[0].children.filter(function(n) { return typeof n === 'string' }).join('').trim() : ''
    }
    var roots = tree && tree.name === 'score-partwise' ? [tree] : children(tree,'score-partwise')
    if (roots.length !== 1) throw Error('Die geprüfte MusicXML-Partitur fehlt.')
    var parts = children(roots[0],'part')
    if (parts.length !== data.parts.length) throw Error('MusicXML-Partzuordnung ist nicht eindeutig.')
    var result = {}
    data.parts.forEach(function(source,index) {
        var voices = {}, perStaff = {}
        children(parts[index],'measure').forEach(function(measure) {
            children(measure,'note').forEach(function(note) {
                var voice = Number(text(note,'voice')), staff = Number(text(note,'staff') || '1')
                if (!isFinite(voice) || voice%1 || voice < 1 || !isFinite(staff) || staff%1 || staff < 1 || staff > 2)
                    throw Error('MusicXML-Stimmzuordnung wird noch nicht unterstützt.')
                if (voices[voice] !== undefined && voices[voice] !== staff)
                    throw Error('Systemwechsel innerhalb einer Stimme wird noch nicht unterstützt.')
                voices[voice] = staff
            })
        })
        Object.keys(voices).map(Number).sort(function(a,b){return a-b}).forEach(function(voice) {
            var staff = voices[voice]
            if (!perStaff[staff]) perStaff[staff] = []
            perStaff[staff].push(voice)
        })
        var expected = {}
        source.measures.forEach(function(measure) { measure.voices.forEach(function(v) { expected[v.voice] = true }) })
        if (Object.keys(expected).length !== Object.keys(voices).length || Object.keys(expected).some(function(v) { return voices[v] === undefined }))
            throw Error('Nicht jede CS1-Stimme ist eindeutig im MusicXML enthalten.')
        result[source.id] = Object.keys(voices).map(Number).sort(function(a,b){return a-b}).map(function(voice) {
            var staff = voices[voice], local = perStaff[staff].indexOf(voice)
            if (local > 3) throw Error('Mehr als vier Stimmen in einem System.')
            return {sourceVoice:voice,targetStaff:staff-1,targetVoice:local}
        })
    })
    return result
}
if (typeof module !== 'undefined') module.exports = nativeVoiceMappingFromMusicXML
