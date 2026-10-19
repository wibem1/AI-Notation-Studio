/* Native MusicXML composition context. Original XML nodes remain intact; output is a new score. */
(function(root){
'use strict';
function parse(xml){
 var tokens=String(xml).match(/<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?(?:\]>|>)|<!\[CDATA\[[\s\S]*?\]\]>|<(?:"[^"]*"|'[^']*'|[^'">])*?>|[^<]+/g)||[],stack=[],top=null;
 if(tokens.join('')!==xml)throw Error('MusicXML konnte nicht gelesen werden.');
 tokens.forEach(function(t){
  if(/^<\?|^<!DOCTYPE/.test(t))return;
  if(/^<\//.test(t)){var node=stack.pop();if(!node||node.name!==t.slice(2,-1).trim())throw Error('MusicXML-Klammern passen nicht.');node.close=t;return;}
  if(/^<[A-Za-z]/.test(t)){var name=/^<([^\s/>]+)/.exec(t)[1],n={name:name,open:t,close:'',children:[]};if(stack.length)stack[stack.length-1].children.push(n);else if(!top)top=n;else throw Error('Mehrere XML-Wurzeln.');if(!/\/>$/.test(t))stack.push(n);}
  else if(stack.length)stack[stack.length-1].children.push(t);
 });
 if(stack.length||!top||top.name!=='score-partwise')throw Error('MusicXML score-partwise wird benötigt.');return top;
}
function serialize(n){return typeof n==='string'?n:n.open+n.children.map(serialize).join('')+n.close;}
function children(n,name){return n.children.filter(function(x){return typeof x!=='string'&&x.name===name;});}
function first(n,name){return children(n,name)[0];}
function text(n,name,def){var x=first(n,name);return x?x.children.filter(function(x){return typeof x==='string';}).join('').trim():def;}
function clone(n){return JSON.parse(JSON.stringify(n));}
function attrs(n){return first(n,'attributes');}
function value(s){var v=0;String(s).split('+').forEach(function(x){v+=Number(x);});return v;}
function timeline(part){
 var division=1,meter=4,time='<time><beats>4</beats><beat-type>4</beat-type></time>',key='<key><fifths>0</fifths></key>',staves=1,transpose=null,start=0,rows=[];
 children(part,'measure').forEach(function(m){
  var cursor=0,maximum=0;
  m.children.forEach(function(n){if(typeof n==='string')return;
   if(n.name==='attributes'){
    division=Number(text(n,'divisions',division));if(!division||!isFinite(division))throw Error('Ungültige MusicXML-divisions.');
    staves=Number(text(n,'staves',staves));
    var t=first(n,'time');if(t){var bs=children(t,'beats'),bt=children(t,'beat-type');if(!bs.length||bs.length!==bt.length)throw Error('Taktart ohne feste Taktlänge ist noch nicht unterstützt.');meter=0;bs.forEach(function(b,i){meter+=value(text({children:[b]},'beats',4))*4/Number(text({children:[bt[i]]},'beat-type',4));});time=serialize(t);}
    var k=first(n,'key');if(k)key=serialize(k);var tr=first(n,'transpose');if(tr)transpose=clone(tr);
   }
   if(n.name==='note'&&!first(n,'chord')&&!first(n,'grace'))cursor+=Number(text(n,'duration',0))/division;
   if(n.name==='backup')cursor-=Number(text(n,'duration',0))/division;
   if(n.name==='forward')cursor+=Number(text(n,'duration',0))/division;
   maximum=Math.max(maximum,cursor);
  });
  var length=/\bimplicit=["']yes["']/.test(m.open)&&maximum>0?maximum:Math.max(meter,maximum);
  rows.push({node:m,start:start,length:length,division:division,time:time,key:key,staves:staves,transpose:transpose});start+=length;
 });return {rows:rows,end:start};
}
function inspect(xml,startQuarter){
 var doc=parse(xml),parts=children(doc,'part');if(!parts.length)throw Error('Ausgangspartitur enthält keine Parts.');var t=timeline(parts[0]),index=t.rows.length,prefix=0;
 for(var i=0;i<t.rows.length;i++)if(startQuarter<t.rows[i].start+t.rows[i].length-1e-7){index=i;prefix=Math.max(0,startQuarter-t.rows[i].start);break;}
 if(startQuarter>t.end+1e-7)throw Error('Einfügeposition liegt hinter dem Partiturende.');
 var row=t.rows[Math.min(index,t.rows.length-1)];
 function signature(r){var t=first(parse('<score-partwise><part-list/><part id="x"><measure number="1"><attributes>'+r.time+'</attributes></measure></part></score-partwise>'),'part');var a=attrs(children(t,'measure')[0]),time=first(a,'time');return text(time,'beats',4)+'/'+text(time,'beat-type',4);}
 return {startMeasure:index+1,prefixQuarter:prefix,end:t.end,time:row?row.time:'<time><beats>4</beats><beat-type>4</beat-type></time>',timeSignature:row?signature(row):'4/4',meters:t.rows.map(function(r,i){return {measure:i+1,timeSignature:signature(r),quarters:r.length};}),key:row?row.key:'',parts:parts.length};
}
function gcd(a,b){while(b){var c=a%b;a=b;b=c;}return a;}
function lcm(a,b){return a/gcd(a,b)*b;}
function blank(row,number,initial,division,staves){
 var content='<attributes><divisions>'+division+'</divisions>'+row.key+row.time+(initial?'<staves>'+staves+'</staves>':'')+'</attributes>',duration=row.length*division;
 if(Math.abs(duration-Math.round(duration))>1e-5)throw Error('Leertakt kann rhythmisch nicht exakt abgebildet werden.');duration=Math.round(duration);
 for(var s=1;s<=staves;s++){if(s>1)content+='<backup><duration>'+duration+'</duration></backup>';content+='<note><rest measure="yes"/><duration>'+duration+'</duration><voice>'+s+'</voice><staff>'+s+'</staff></note>';}
 return first(parse('<score-partwise><part-list/><part id="x"><measure number="'+number+'">'+content+'</measure></part></score-partwise>'),'part').children.filter(function(n){return n.name==='measure';})[0];
}
function renumber(m,n){m.open=m.open.replace(/\bnumber\s*=\s*("[^"]*"|'[^']*')/,'number="'+n+'"');}
function regularEnd(part){var measures=children(part,'measure'),last=measures[measures.length-1];if(!last)return;children(last,'barline').forEach(function(b){var style=first(b,'bar-style');if(style&&text(b,'bar-style','')==='light-heavy')style.children=['regular'];});}
function transposePart(part,tr){
 if(!tr)return;
 var oct=Number(text(tr,'octave-change',0)),chromatic=Number(text(tr,'chromatic',0)),diatonic=Number(text(tr,'diatonic',NaN));
 if(!isFinite(diatonic)){var sign=chromatic<0?-1:1;diatonic=sign*[0,1,1,2,2,3,3,4,5,5,6,6][Math.abs(chromatic)%12]+Math.trunc(chromatic/12)*7;}
 var delta=-chromatic-oct*12,dia=-diatonic-oct*7,steps=['C','D','E','F','G','A','B'],semitones=[0,2,4,5,7,9,11];
 function mod(x,n){return (x%n+n)%n;}
 function leaf(name,v){return {name:name,open:'<'+name+'>',close:'</'+name+'>',children:[String(v)]};}
 children(part,'measure').forEach(function(m,mi){
  var a=attrs(m);if(a){var k=first(a,'key');if(k&&first(k,'fifths')){var old=Number(text(k,'fifths',0)),needed=mod(4*old+dia,7),choices=[];for(var f=-14;f<=14;f++)if(mod(f*7-old*7,12)===mod(delta,12)&&mod(4*f,7)===needed)choices.push(f);choices.sort(function(x,y){return Math.abs(x)-Math.abs(y);});if(!choices.length)throw Error('Transponierte Tonart nicht darstellbar.');first(k,'fifths').children=[String(choices[0])];}
   if(mi===0)a.children.push(clone(tr));
  }
  children(m,'note').forEach(function(n){var p=first(n,'pitch');if(!p)return;var i=steps.indexOf(text(p,'step','C')),o=Number(text(p,'octave',4)),alter=Number(text(p,'alter',0)),midi=(o+1)*12+semitones[i]+alter+delta,di=(o*7+i)+dia,no=Math.floor(di/7),ni=mod(di,7),na=midi-(no+1)*12-semitones[ni];p.children=[leaf('step',steps[ni])];if(na)p.children.push(leaf('alter',na));p.children.push(leaf('octave',no));});
 });
}
function checkPrefix(part,quarter){
 if(quarter<=1e-7)return;var m=children(part,'measure')[0],division=1,cursor=0;
 m.children.forEach(function(n){if(typeof n==='string')return;if(n.name==='attributes')division=Number(text(n,'divisions',division));if(n.name==='backup')cursor-=Number(text(n,'duration',0))/division;if(n.name==='forward')cursor+=Number(text(n,'duration',0))/division;
  if(n.name==='note'){if(first(n,'pitch')&&!first(n,'chord')&&cursor<quarter-1e-7)throw Error('CS1 beginnt vor dem Auswahlbeginn. Im ersten Takt fehlen die vorgegebenen Anfangspausen.');if(!first(n,'chord')&&!first(n,'grace'))cursor+=Number(text(n,'duration',0))/division;}
 });
}
function checkBoundaries(xml,start,end){
 var doc=parse(xml),parts=children(doc,'part');
 parts.forEach(function(p){
  var rows=timeline(p).rows,open={};
  function active(){return Object.keys(open).some(function(k){return open[k]>0;});}
  rows.forEach(function(r){
   if((Math.abs(r.start-start)<1e-7||Math.abs(r.start-end)<1e-7)&&active())throw Error('Eine Bindung oder Ausdruckslinie überspannt die Bearbeitungsgrenze. Bitte eine andere Grenze wählen.');
   function walk(n,voice,staff,pitch){
    if(typeof n==='string')return;
    if(n.name==='note'){voice=text(n,'voice','1');staff=text(n,'staff','1');var pp=first(n,'pitch');pitch=pp?serialize(pp):'rest';}
    if(['tie','tied','slur','wedge','pedal','octave-shift','bracket','dashes','glissando','slide'].indexOf(n.name)>=0){
     var t=/\btype=["']([^"']+)["']/.exec(n.open),num=/\bnumber=["']([^"']+)["']/.exec(n.open),type=t?t[1]:'',key=n.name+':'+(num?num[1]:'1');
     if(n.name==='tie'||n.name==='tied')key+=':'+voice+':'+staff+':'+pitch;
     if(['start','crescendo','diminuendo','up','down','resume','sostenuto'].indexOf(type)>=0)open[key]=(open[key]||0)+1;
     if(type==='stop'||type==='discontinue')open[key]=Math.max(0,(open[key]||0)-1);
    }
    n.children.forEach(function(c){walk(c,voice,staff,pitch);});
   }
   walk(r.node,'1','1','');
  });
  var total=timeline(p).end;
  if((Math.abs(total-start)<1e-7||Math.abs(total-end)<1e-7)&&active())throw Error('Am Partiturende ist eine Bindung oder Ausdruckslinie offen.');
 });
 return true;
}
function replaceRange(baseXML,addedXML,options){
 var base=parse(baseXML),added=parse(addedXML),parts=children(base,'part'),extra=children(added,'part');
 var start=Number(options.startQuarter),end=Number(options.endQuarter),info=inspect(baseXML,start),ending=inspect(baseXML,end);
 if(info.prefixQuarter||ending.prefixQuarter||end<=start)throw Error('Die Überarbeitung benötigt vollständige Takte.');
 if(parts.length!==extra.length)throw Error('Die Besetzung der Überarbeitung muss unverändert bleiben.');
 checkBoundaries(baseXML,start,end);
 if(options.kind==='replaceTail'&&Math.abs(end-inspect(baseXML,end).end)>1e-7)throw Error('Übergang muss am Partiturende liegen.');
 parts.forEach(function(p,i){
  var old=timeline(p),from=info.startMeasure-1,to=ending.startMeasure-1,addedTime=timeline(extra[i]);
  if(options.kind==='replace'&&addedTime.rows.length!==to-from)throw Error('Die Überarbeitung muss dieselbe Taktzahl haben.');
  if(options.kind==='replaceTail'&&addedTime.rows.length<=to-from)throw Error('Die neuen Takte der Fortsetzung fehlen.');
  if(old.rows.length!==ending.meters.length)throw Error('Ausgangsparts haben verschiedene Taktzahlen.');
  for(var j=0;j<to-from;j++)if(!addedTime.rows[j]||Math.abs(addedTime.rows[j].length-old.rows[from+j].length)>1e-7)throw Error('Die Taktlänge der überarbeiteten Takte muss erhalten bleiben.');
  transposePart(extra[i],old.rows[from].transpose);
  if(timeline(extra[i]).rows[0].staves!==old.rows[from].staves)throw Error('Anzahl der Notensysteme verändert.');
  var ms=children(p,'measure'),addition=children(extra[i],'measure').map(clone),suffix=options.kind==='replaceTail'?[]:ms.slice(to);
  // Generated final barlines must not close an internal replacement.
  if(suffix.length)regularEnd(extra[i]);
  addition=children(extra[i],'measure').map(clone);
  if(suffix.length){
   // Restore the full inherited state at the untouched following measure.
   var row=old.rows[to],a=attrs(suffix[0]);
   if(!a){a={name:'attributes',open:'<attributes>',close:'</attributes>',children:[]};suffix[0].children.unshift(a);}
   ['divisions','time','key'].forEach(function(tag){a.children=a.children.filter(function(x){return typeof x==='string'||x.name!==tag;});});
   a.children.unshift({name:'divisions',open:'<divisions>',close:'</divisions>',children:[String(row.division)]});
   var restore=parse('<score-partwise><part-list/><part id="x"><measure number="1"><attributes>'+row.key+row.time+'</attributes></measure></part></score-partwise>');
   attrs(children(first(restore,'part'),'measure')[0]).children.forEach(function(x){a.children.push(clone(x));});
  }
  var all=ms.slice(0,from).concat(addition,suffix);
  p.children=p.children.filter(function(n){return typeof n==='string'||n.name!=='measure';});
  all.forEach(function(m,k){if(k>=from&&k<from+addition.length)renumber(m,k+1);p.children.push(m);});
 });
 return {xml:'<?xml version="1.0" encoding="UTF-8"?>\n'+serialize(base),warnings:['Überarbeitung als neue Partitur; Original bleibt erhalten. Layout kann sich durch MusicXML ändern.']};
}

function combine(baseXML,addedXML,options){
 if(options.kind==="replace"||options.kind==="replaceTail")return replaceRange(baseXML,addedXML,options);
 var base=parse(baseXML),added=parse(addedXML),baseParts=children(base,'part'),newParts=children(added,'part'),baseList=first(base,'part-list'),newList=first(added,'part-list');
 if(!baseList||!newList||!baseParts.length||!newParts.length)throw Error('MusicXML-Partstruktur fehlt.');
 var start=Number(options.startQuarter||0),info=inspect(baseXML,start),index=info.startMeasure-1,baseTime=timeline(baseParts[0]),addTime=timeline(newParts[0]),rows=baseTime.rows.slice(0),warnings=[];
 if(options.kind==='append'&&Math.abs(start-baseTime.end)>1e-7)throw Error('Fortsetzen muss am Partiturende beginnen.');
 if(options.kind==='append'&&baseParts.length!==newParts.length)throw Error('Fortsetzung muss dieselbe Anzahl Instrumente enthalten.');
 while(rows.length<index+addTime.rows.length){var a=addTime.rows[rows.length-index];rows.push({start:rows.length?rows[rows.length-1].start+rows[rows.length-1].length:0,length:a.length,time:a.time,key:a.key,division:a.division});}
 addTime.rows.forEach(function(r,i){if(Math.abs(r.length-rows[index+i].length)>1e-7)throw Error('CS1-Takt '+(i+1)+' passt zeitlich nicht zu Takt '+(index+i+1)+' der Ausgangspartitur. Bitte Taktart und Taktlänge prüfen.');});
 newParts.forEach(function(p){checkPrefix(p,info.prefixQuarter);});
 if(options.kind==='append'){
  baseParts.forEach(function(p,i){regularEnd(p);var old=timeline(p),extra=children(newParts[i],'measure');if(old.rows.length!==index)throw Error('Ausgangsparts haben unterschiedliche Taktzahlen.');
   transposePart(newParts[i],old.rows[old.rows.length-1].transpose);extra=children(newParts[i],'measure');
   var sourceStaves=old.rows.length?old.rows[old.rows.length-1].staves:1,newStaves=timeline(newParts[i]).rows[0].staves;
   if(sourceStaves!==newStaves)throw Error('Fortsetzung hat eine andere Anzahl Notensysteme.');
   extra.forEach(function(m,k){var c=clone(m);renumber(c,index+k+1);p.children.push(c);});
  });
 }else{
  // Extend original parts only if the result reaches beyond the old score.
  baseParts.forEach(function(p){var t=timeline(p),last=t.rows[t.rows.length-1];if(t.rows.length!==baseTime.rows.length)throw Error('Ausgangsparts haben unterschiedliche Taktzahlen.');if(rows.length>t.rows.length)regularEnd(p);for(var i=t.rows.length;i<rows.length;i++)p.children.push(blank(rows[i],i+1,false,lcm(last.division,rows[i].division),last.staves));});
  newParts.forEach(function(p,i){var id='CS'+(i+1),suffix=1,existing=serialize(baseList);while(existing.indexOf('id="'+id+'"')>=0)id='CS'+(i+1)+'_'+(++suffix);
   var definition=clone(children(newList,'score-part')[i]);if(!definition)throw Error('Neue Instrumentdefinition fehlt.');var oldID=/\bid=["']([^"']+)["']/.exec(p.open)[1];
   function changeIDs(n){if(typeof n==='string')return;n.open=n.open.replace(/\b(id|idref)=("([^"]*)"|'([^']*)')/g,function(all,name,quoted,a,b){var v=a||b;return name+'="'+(v===oldID?id:id+'-'+v)+'"';});n.children.forEach(changeIDs);}
   changeIDs(definition);var used=serialize(baseList),channel=1;while(channel<=16&&(channel===10||new RegExp('<midi-channel>\\s*'+channel+'\\s*</midi-channel>').test(used)))channel++;children(definition,'midi-instrument').forEach(function(ins){var c=first(ins,'midi-channel');if(c&&channel<=16)c.children=[String(channel)];});baseList.children.push(definition);var np=clone(p);changeIDs(np);var original=children(np,'measure'),t=timeline(p),division=t.rows[0].division,staves=t.rows[0].staves;
   if(index+original.length<rows.length)regularEnd(np);
   rows.forEach(function(r){division=lcm(division,r.division);});if(division>10000000)throw Error('Kontext-Auflösung ist zu groß.');np.children=[];
   for(var k=0;k<rows.length;k++){
    if(k>=index&&k<index+original.length){var m=original[k-index];renumber(m,k+1);np.children.push(m);}
    else np.children.push(blank(rows[k],k+1,k===0,division,staves));
   }
   // Preserve the new instrument's clefs before its initial rests.
   if(index>0){var init=attrs(original[0]),target=attrs(children(np,'measure')[0]);children(init,'clef').forEach(function(c){target.children.push(clone(c));});}
   base.children.push(np);
  });
 }
 warnings.push('Die kombinierte Fassung wird als neue Partitur geöffnet. Das Original bleibt erhalten; MuseScore-spezifisches Layout kann sich durch MusicXML ändern.');
 return {xml:'<?xml version="1.0" encoding="UTF-8"?>\n'+serialize(base),warnings:warnings};
}
var api={parse:parse,inspect:inspect,combine:combine,checkBoundaries:checkBoundaries};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.CompactContext=api;
})(typeof globalThis!=='undefined'?globalThis:this);
