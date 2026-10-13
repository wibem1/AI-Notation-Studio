// ES5, self contained; operates on the existing CompactContext XML tree.
function createNotationStructure(context) {
    function children(n, tag) { return n.children.filter(function(x) { return typeof x !== 'string' && (!tag || x.name === tag) }) }
    function first(n, tag) { return children(n, tag)[0] }
    function text(n, tag, fallback) { var x=first(n,tag); return x ? x.children.join('').trim() : fallback }
    function clone(n) { return JSON.parse(JSON.stringify(n)) }
    function node(tag, value) { return {name:tag,open:'<'+tag+'>',close:'</'+tag+'>',children:[String(value)]} }
    function empty(tag) { return {name:tag,open:'<'+tag+'/>',close:'',children:[]} }
    function serialize(n) { return typeof n==='string' ? n : n.open+n.children.map(serialize).join('')+n.close }
    function pitch(n) { var p=first(n,'pitch'); if(!p) return null; return (Number(text(p,'octave',0))+1)*12+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[text(p,'step','')]+Number(text(p,'alter',0)) }
    function tie(n, kind) { return children(n,'tie').some(function(x){return x.open.indexOf('"'+kind+'"')>=0 || x.open.indexOf("'"+kind+"'")>=0}) }
    function rhythm(duration, divisions) {
        var names=['whole','half','quarter','eighth','16th','32nd','64th','128th'];
        for(var i=0;i<names.length;i++) for(var dots=0;dots<=2;dots++) {
            var d=divisions*4/Math.pow(2,i)*(2-Math.pow(.5,dots));
            if(Math.abs(d-duration)<1e-7) return {type:names[i],dots:dots}
        }
        return null
    }
    function measureRows(part) {
        var divisions=1,beats=4,beatType=4,start=0,result=[];
        children(part,'measure').forEach(function(m,index){
            var a=first(m,'attributes');
            if(a){divisions=Number(text(a,'divisions',divisions));var time=first(a,'time');if(time){beats=Number(text(time,'beats',NaN));beatType=Number(text(time,'beat-type',NaN))}}
            if(!(divisions>0 && beats>0 && beatType>0)) throw Error('Taktart oder Zeitraster wird nicht unterstützt.');
            var cursor=0,last=0,maximum=0,events=[],anchors=[],unsafe=false;
            children(m).forEach(function(n){
                if(n.name==='note') {
                    var dur=Number(text(n,'duration',0)), onset=first(n,'chord')?last:cursor;
                    if(children(n).some(function(x){return ['chord','pitch','rest','duration','tie','voice','type','dot','accidental','stem','staff','beam','notations'].indexOf(x.name)<0})) unsafe=true;
                    var nt=first(n,'notations');
                    if(nt && children(nt).some(function(x){return x.name!=='tied'})) unsafe=true;
                    events.push({node:n,start:onset,end:onset+dur,duration:dur,staff:Number(text(n,'staff',1)),voice:String(text(n,'voice','1')),pitch:pitch(n),stop:tie(n,'stop'),next:tie(n,'start')});
                    if(!first(n,'chord') && !first(n,'grace')) {last=cursor;cursor+=dur}
                    maximum=Math.max(maximum,cursor,onset+dur);
                } else if(n.name==='backup') cursor-=Number(text(n,'duration',0));
                else if(n.name==='forward') {cursor+=Number(text(n,'duration',0));maximum=Math.max(maximum,cursor)}
                else { anchors.push({node:n,position:cursor}); if(n.name==='attributes' && cursor!==0) unsafe=true; if(n.name==='harmony'||n.name==='figured-bass') unsafe=true }
            });
            var nominal=divisions*beats*4/beatType,length=Math.max(nominal,maximum);
            if(/implicit=["']yes["']/.test(m.open)) length=maximum;
            result.push({node:m,index:index,number:(/number=["']([^"']*)/.exec(m.open)||[])[1]||String(index+1),divisions:divisions,length:length,start:start,events:events,anchors:anchors,unsafe:unsafe});
            start+=length/divisions;
        });return result
    }
    function signature(doc) {
        var all=[];
        children(doc,'part').forEach(function(part,pi){
            var chains={};
            measureRows(part).forEach(function(row){row.events.forEach(function(e){
                if(e.pitch===null)return;
                var start=row.start+e.start/row.divisions,end=row.start+e.end/row.divisions,key=e.staff+':'+e.pitch;
                var previous=chains[key];
                if(e.stop && previous && Math.abs(previous.end-start)<1e-7) {previous.end=end;previous.continues=e.next}
                else {previous={part:pi,staff:e.staff,pitch:e.pitch,start:start,end:end,continues:e.next,dynamics:(/dynamics=["']([^"']*)/.exec(e.node.open)||[])[1]||''};all.push(previous)}
                if(e.next)chains[key]=previous;else delete chains[key];
            })});
        });
        return JSON.stringify(all.map(function(e){return [e.part,e.staff,e.pitch,+e.start.toFixed(8),+e.end.toFixed(8),e.dynamics]}).sort(function(a,b){return JSON.stringify(a).localeCompare(JSON.stringify(b))}))
    }
    function noteFor(e,start,end,voice,isChord,stem,divisions) {
        var n=clone(e.node),r=rhythm(end-start,divisions);if(!r)throw Error('Nicht darstellbarer Notenwert.');
        n.open=n.open.replace(/\s(?:default-x|default-y|relative-x|relative-y)=["'][^"']*["']/g,'');
        var before=start>e.start||e.stop,after=end<e.end||e.next;
        n.children=n.children.filter(function(x){return typeof x==='string'||['chord','duration','tie','voice','type','dot','stem','beam','accidental','notations'].indexOf(x.name)<0});
        var p=first(n,'pitch'),insert=n.children.indexOf(p)+1;
        var middle=[node('duration',end-start)];
        if(before)middle.push({name:'tie',open:'<tie type="stop"/>',close:'',children:[]});
        if(after)middle.push({name:'tie',open:'<tie type="start"/>',close:'',children:[]});
        middle.push(node('voice',voice),node('type',r.type));
        for(var d=0;d<r.dots;d++)middle.push(empty('dot'));
        middle.push(node('stem',stem));
        n.children.splice.apply(n.children,[insert,0].concat(middle));
        if(isChord)n.children.unshift(empty('chord'));
        if(before||after){var nt={name:'notations',open:'<notations>',close:'</notations>',children:[]};if(before)nt.children.push({name:'tied',open:'<tied type="stop"/>',close:'',children:[]});if(after)nt.children.push({name:'tied',open:'<tied type="start"/>',close:'',children:[]});n.children.push(nt)}
        return n
    }
    function rest(start,end,voice,staff,divisions) {
        var r=rhythm(end-start,divisions);if(!r)throw Error('Nicht darstellbare Pause.');
        var n={name:'note',open:'<note>',close:'</note>',children:[empty('rest'),node('duration',end-start),node('voice',voice),node('type',r.type)]};
        for(var d=0;d<r.dots;d++)n.children.push(empty('dot'));
        n.children.push(node('staff',staff));return n
    }
    function repair(xml,selection) {
        var doc=context.parse(xml),before=signature(doc),reports=[],changed=0,operations=[];
        if(!selection || !(selection.endQuarter>selection.startQuarter) || !selection.staffs.length)throw Error('Bitte vollständige Takte als Bereich markieren.');
        children(doc,'part').forEach(function(part,pi){
            // Staff numbering in selection is local to this part; caller resolves part IDs.
            if(selection.partIndex!==undefined && pi!==selection.partIndex)return;
            measureRows(part).forEach(function(row){
                var full=row.start>=selection.startQuarter-1e-7 && row.start+row.length/row.divisions<=selection.endQuarter+1e-7;
                if(!full)return;
                var replacements={},repaired=false;
                selection.staffs.forEach(function(staff){
                    var es=row.events.filter(function(e){return e.staff===staff&&e.pitch!==null}),voices={};
                    es.forEach(function(e){voices[e.voice]=true});var count=Object.keys(voices).length;
                    if(count<3)return;
                    var prefix='Takt '+row.number+' · System '+staff+': '+count+' klingende Stimmen';
                    if(row.unsafe){reports.push(prefix+'; Sondernotation verhindert eine automatische Umstrukturierung.');return}
                    var lowest=es.filter(function(e){return e.start===0}).sort(function(a,b){return a.pitch-b.pitch})[0];
                    if(!lowest||lowest.start!==0||lowest.duration<row.length/2){reports.push(prefix+'; kein eindeutig gehaltener Bass für das Zusammenfassen.');return}
                    var bass=[lowest],bassEnd=lowest.end;
                    while(bassEnd<row.length){var next=es.filter(function(e){return e.start===bassEnd}).sort(function(a,b){return a.pitch-b.pitch})[0];if(!next)break;bass.push(next);bassEnd=next.end}
                    var upper=es.filter(function(e){return bass.indexOf(e)<0});
                    if(bass.some(function(e){return upper.some(function(f){return f.pitch<e.pitch&&e.start<f.end&&f.start<e.end})})){reports.push(prefix+'; Stimmenkreuzungen verhindern das eindeutige Abtrennen des Basses.');return}
                    if(bass.some(function(e,i){return bass.some(function(f,j){return i!==j&&e.start<f.end&&f.start<e.end})})){reports.push(prefix+'; Bassstimme enthält überlagerte Akkordnoten.');return}
                    var duplicate=upper.some(function(e,i){return upper.some(function(f,j){return i!==j&&e.pitch===f.pitch&&e.start<f.end&&f.start<e.end})});
                    if(duplicate){reports.push(prefix+'; überlagerte gleiche Tonhöhen werden nicht zusammengelegt.');return}
                    try{
                        var lanes=[];
                        [upper,bass].forEach(function(events,lane){
                            var cuts=[0,row.length];events.forEach(function(e){cuts.push(e.start,e.end)});cuts.sort(function(a,b){return a-b});cuts=cuts.filter(function(x,i){return i===0||x!==cuts[i-1]});
                            var voice=(staff-1)*4+lane+1,notes=[];
                            for(var i=0;i<cuts.length-1;i++){
                                var start=cuts[i],end=cuts[i+1],active=events.filter(function(e){return e.start<=start&&e.end>=end});active.sort(function(a,b){return a.pitch-b.pitch});
                                if(active.length) active.forEach(function(e,j){notes.push(noteFor(e,start,end,voice,j>0,lane===0?'up':'down',row.divisions))});
                                else notes.push(rest(start,end,voice,staff,row.divisions));
                            }lanes.push(notes)
                        });replacements[staff]=lanes;repaired=true;changed++;
                        reports.push(prefix+' → 2 Stimmen: Bass separat, darüber Akkorde mit gebundenen Fortsetzungen. Einsätze und klingende Dauern bleiben erhalten.');
                    }catch(e){reports.push(prefix+'; '+String(e.message||e))}
                });
                if(!repaired)return;
                // Keep non-note objects and explicitly re-anchor directions at their musical position.
                var rebuilt=[];
                row.anchors.forEach(function(a){var n=clone(a.node);if(n.name==='direction'){
                    var offset=Number(text(n,'offset',0))+a.position;n.children=n.children.filter(function(x){return typeof x==='string'||x.name!=='offset'});
                    var where=n.children.findIndex(function(x){return typeof x!=='string'&&(x.name==='staff'||x.name==='sound')});
                    if(where<0)where=n.children.length;n.children.splice(where,0,node('offset',offset));
                }rebuilt.push(n)});
                var streams=[],keep={};
                row.events.forEach(function(e){if(replacements[e.staff])return;var key=e.staff+':'+e.voice;if(!keep[key])keep[key]=[];keep[key].push(e)});
                Object.keys(keep).forEach(function(key){var events=keep[key],stream=[],cursor=0;
                    events.forEach(function(e){if(!first(e.node,'chord')){if(e.start<cursor)throw Error('Ungültiger Stimmverlauf.');if(e.start>cursor)stream.push({name:'forward',open:'<forward>',close:'</forward>',children:[node('duration',e.start-cursor)]});cursor=e.end}stream.push(clone(e.node))});
                    if(cursor<row.length)stream.push({name:'forward',open:'<forward>',close:'</forward>',children:[node('duration',row.length-cursor)]});streams.push(stream)
                });
                Object.keys(replacements).forEach(function(s){replacements[s].forEach(function(lane){streams.push(lane)})});
                streams.forEach(function(stream,i){if(i)rebuilt.push({name:'backup',open:'<backup>',close:'</backup>',children:[node('duration',row.length)]});rebuilt=rebuilt.concat(stream)});
                row.node.children=rebuilt;row.node.open=row.node.open.replace(/\swidth=["'][^"']*["']/g,'');
                Object.keys(replacements).forEach(function(s){
                    var events=[];
                    replacements[s].forEach(function(lane,voice){var position=0,previous=null;
                        lane.forEach(function(n){var duration=Number(text(n,'duration',0)),p=pitch(n);
                            if(first(n,'chord'))previous.notes.push({pitch:p,tieStart:tie(n,'start'),tieStop:tie(n,'stop')});
                            else {previous={tick:Math.round((row.start+position/row.divisions)*480),durationTicks:Math.round(duration/row.divisions*480),voice:voice,notes:p===null?[]:[{pitch:p,tieStart:tie(n,'start'),tieStop:tie(n,'stop')}]};events.push(previous);position+=duration}
                        })
                    });operations.push({partIndex:pi,staff:Number(s),startTick:Math.round(row.start*480),endTick:Math.round((row.start+row.length/row.divisions)*480),events:events})
                });
            });
        });
        if(signature(doc)!==before)throw Error('Die Klangprüfung ist fehlgeschlagen; die Änderung wird verworfen.');
        return {xml:'<?xml version="1.0" encoding="UTF-8"?>\n'+serialize(doc),changed:changed,operations:operations,report:reports.join('\n')||'Keine Passage mit mindestens drei klingenden Stimmen in vollständig markierten Takten erkannt.'}
    }
    return {repair:repair,signature:function(xml){return signature(context.parse(xml))}}
}
