function createNotationDirect(toFraction) {
    function same(a,b) { return a===b || (a && typeof a.is==='function' && a.is(b)) }
    function cursorAt(score,staff,voice,tick) {
        // rewindToTick scans forward in the selected voice and skips staggered onsets.
        // rewindToFraction preserves the exact segment, including empty target voices.
        if(typeof toFraction!=='function')throw Error('Exakte Cursorpositionierung ist nicht verfügbar.');
        var c=score.newCursor();c.staffIdx=staff;c.voice=voice;c.rewindToFraction(toFraction(tick));
        return c
    }
    function tickOf(note) { return Number(note.parent.parent.tick) }
    function at(score,staff,voice,tick) {
        var c=cursorAt(score,staff,voice,tick);
        if(!c.segment || c.tick!==tick) return null;
        return c.element
    }
    function apply(score,operations,api) {
        if(!operations || !operations.length)throw Error('Kein Korrekturplan vorhanden.');
        var chords=[],metadata=[],started=false;
        function rewritten(note) {
            var tick=tickOf(note),staff=Math.floor(note.parent.track/4);
            return operations.some(function(op){return op.globalStaff===staff && tick>=op.startTick && tick<op.endTick})
        }
        // Collect live metadata before mutating any wrapper; inspect all four voices.
        operations.forEach(function(op){
            var staff=score.staves && score.staves[op.globalStaff];
            if(staff && ['playbackVoice1','playbackVoice2','playbackVoice3','playbackVoice4'].some(function(key){return staff[key]===false}))
                throw Error('Systeme mit stummgeschalteten Stimmen werden nicht direkt umgebaut.');
            for(var voice=0;voice<4;voice++){
                var c=cursorAt(score,op.globalStaff,voice,op.startTick);
                while(c.segment && c.tick<op.endTick){
                    var el=c.element;
                    if(el && el.name==='Chord'){
                        if(el.staffMove)throw Error('Noten über mehrere Systeme werden nicht direkt umgebaut.');
                        if(el.graceNotes && el.graceNotes.length)throw Error('Vorschlagsnoten werden nicht direkt umgebaut.');
                        var tick=c.tick,duration=el.actualDuration.ticks;
                        for(var n=0;n<el.notes.length;n++){
                            var note=el.notes[n];
                            if(note.pitch%1 || note.tuning)throw Error('Mikrotonale Noten werden nicht direkt umgebaut.');
                            if(note.tpc1!==undefined && note.tpc2!==undefined && note.tpc1!==note.tpc2)throw Error('Transponierende Notation wird nicht direkt umgebaut.');
                            if(note.elements && note.elements.length)throw Error('Noten mit zusätzlichen Zeichen werden nicht direkt umgebaut.');
                            if(note.tieBack && note.tieBack.startNote && !rewritten(note.tieBack.startNote))throw Error('Haltebogen über den Auswahlbeginn: bitte weitere Takte markieren.');
                            if(note.tieForward && note.tieForward.endNote && !rewritten(note.tieForward.endNote))throw Error('Haltebogen über das Auswahlende: bitte weitere Takte markieren.');
                            metadata.push({staff:op.globalStaff,tick:tick,end:tick+duration,pitch:note.pitch,tpc1:note.tpc1,tpc2:note.tpc2,tpc:note.tpc,veloType:note.veloType,userVelocity:note.userVelocity,visible:note.visible,play:note.play,color:note.color});
                        }
                        if(!chords.some(function(x){return same(x,el)}))chords.push(el)
                    }
                    c.next()
                }
            }
        });
        // Resolve every new note to a real source note before starting the transaction.
        operations.forEach(function(op){op.events.forEach(function(event){event.notes.forEach(function(n){
            var candidates=metadata.filter(function(m){return m.staff===op.globalStaff && m.pitch===n.pitch && m.tick<=event.tick && m.end>event.tick});
            if(candidates.length!==1)throw Error('Keine eindeutige Zuordnung zur ursprünglichen Note.');
            n.source=candidates[0]
        })})});
        try{
            score.startCmd('AI Notation Studio: Notendarstellung korrigieren');started=true;
            chords.forEach(function(chord){api.removeElement(chord)});
            operations.forEach(function(op){
                // Unused secondary voices may retain engine-created rests; hide these explicitly.
                for(var v=2;v<4;v++){
                    var c=cursorAt(score,op.globalStaff,v,op.startTick);
                    while(c.segment && c.tick<op.endTick){if(c.element && c.element.name==='Rest')c.element.visible=false;c.next()}
                }
                op.events.forEach(function(event){
                    var c=cursorAt(score,op.globalStaff,event.voice,event.tick);
                    if(!c.segment || c.tick!==event.tick)throw Error('MuseScore konnte die Einfügeposition nicht exakt erreichen.');
                    c.setDuration(event.durationTicks,1920);
                    if(!event.notes.length)c.addRest();
                    else event.notes.forEach(function(n,index){
                        var insert=cursorAt(score,op.globalStaff,event.voice,event.tick);insert.setDuration(event.durationTicks,1920);insert.addNote(n.pitch,index>0)
                    });
                    var el=at(score,op.globalStaff,event.voice,event.tick);
                    if(!el || !el.actualDuration || el.actualDuration.ticks!==event.durationTicks)throw Error('MuseScore hat den Notenwert nicht exakt übernommen.');
                    if(!event.notes.length){if(el.name!=='Rest')throw Error('Die Pause wurde nicht übernommen.');el.visible=true;return}
                    if(el.name!=='Chord' || el.notes.length!==event.notes.length)throw Error('Der neue Akkord ist unvollständig.');
                    el.stemDirection=event.voice===0?api.up:api.down;
                    event.notes.forEach(function(n){
                        var matches=[];for(var i=0;i<el.notes.length;i++)if(el.notes[i].pitch===n.pitch)matches.push(el.notes[i]);
                        if(matches.length!==1)throw Error('MuseScore hat die Tonhöhe nicht exakt übernommen.');
                        var live=matches[0],source=n.source;n.live=live;
                        if(source.tpc1!==undefined)live.tpc1=source.tpc1;if(source.tpc2!==undefined)live.tpc2=source.tpc2;
                        if(source.tpc1===undefined)live.tpc=source.tpc;
                        ['veloType','userVelocity','visible','play','color'].forEach(function(key){if(source[key]!==undefined)live[key]=source[key]})
                    })
                })
            });
            // Reuse the already constructed destination chord through chord-tie.
            // The generic toggle action can enter note-input/toggle behaviour.
            api.cmd('escape');
            operations.forEach(function(op){op.events.forEach(function(event){event.notes.forEach(function(n){if(n.tieStart){
                var expected=at(score,op.globalStaff,event.voice,event.tick+event.durationTicks);
                if(!expected || expected.name!=='Chord')throw Error('Der Zielakkord des Haltebogens fehlt.');
                var target=null;
                for(var i=0;i<expected.notes.length;i++)if(expected.notes[i].pitch===n.pitch){
                    if(target)throw Error('Mehrdeutige Zielnote für den Haltebogen.');target=expected.notes[i]
                }
                if(!target || target.tpc1!==n.live.tpc1 || target.tpc2!==n.live.tpc2)
                    throw Error('Die Zielnote des Haltebogens hat eine abweichende Tonhöhe oder Schreibweise.');
                var existing=n.live.tieForward;
                if(existing){
                    if(!existing.endNote || !same(existing.endNote,target))throw Error('Ein unerwarteter Haltebogen ist bereits vorhanden.');
                }else{
                    if(!score.selection.select(n.live,false))throw Error('Die Note konnte für den Haltebogen nicht gewählt werden.');
                    api.cmd('chord-tie');
                }
                var tie=n.live.tieForward;
                if(!tie || !tie.endNote || !same(tie.endNote,target))
                    throw Error('Haltebogen nicht übernommen bei Tick '+event.tick+', System '+(op.globalStaff+1)+', Stimme '+(event.voice+1)+', Ton '+n.pitch+'. Änderung zurückgenommen.')
            }})})});
            // Verify the complete intended rhythm and all tie endpoints, including absence of extra attacks.
            operations.forEach(function(op){op.events.forEach(function(event){event.notes.forEach(function(n){
                if(n.live.pitch!==n.pitch || n.live.parent.actualDuration.ticks!==event.durationTicks || !!n.live.tieBack!==n.tieStop || !!n.live.tieForward!==n.tieStart)
                    throw Error('Die abschließende Klangprüfung ist fehlgeschlagen.');
                ['userVelocity','veloType','play'].forEach(function(key){if(n.source[key]!==undefined && n.live[key]!==n.source[key])throw Error('Wiedergabeeigenschaften wurden verändert.')})
            })});
                for(var v=2;v<4;v++){var c=cursorAt(score,op.globalStaff,v,op.startTick);while(c.segment&&c.tick<op.endTick){if(c.element&&c.element.name==='Chord')throw Error('Eine alte Stimme ist noch vorhanden.');c.next()}}
            });
            if(api.verify && !api.verify())throw Error('Die Kontrolle der vollständigen Partitur ist fehlgeschlagen.');
            score.endCmd(false);started=false;
            return {changed:operations.length}
        }catch(e){if(started)score.endCmd(true);throw e}
    }
    return {apply:apply}
}
