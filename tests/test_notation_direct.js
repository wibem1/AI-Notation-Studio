const fs=require('fs'),vm=require('vm'),assert=require('assert');
const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync(process.argv[2]||require('path').join(__dirname,'../notation-direct.js'),'utf8'),scope);
function fixture(){
 const grid=new Map(),ends=[],calls=[];let selected=null,backup=null;
 function set(tick,voice,el){grid.set(tick+':'+voice,el);el.parent={tick};el.track=4+voice;if(el.notes)el.notes.forEach(n=>{n.parent=el;n.elements=[];n.tuning=0;n.tpc1=14;n.tpc2=14;n.tpc=14;n.visible=true;n.play=true;n.veloType=1;n.userVelocity=72});return el}
 set(0,0,{name:'Rest',visible:true,actualDuration:{ticks:720}});
 set(720,0,{name:'Chord',notes:[{pitch:59}],actualDuration:{ticks:1200}});
 set(480,1,{name:'Chord',notes:[{pitch:55}],actualDuration:{ticks:1440}});
 set(240,2,{name:'Chord',notes:[{pitch:47}],actualDuration:{ticks:1680}});
 set(0,3,{name:'Chord',notes:[{pitch:40}],actualDuration:{ticks:1920}});
 function snapshot(){return [...grid.entries()].map(([key,el])=>({key,name:el.name,visible:el.visible,duration:el.actualDuration.ticks,notes:(el.notes||[]).map(n=>({pitch:n.pitch,veloType:n.veloType,userVelocity:n.userVelocity}))}))}
 function restore(data){grid.clear();data.forEach(x=>{const [t,v]=x.key.split(':').map(Number);set(t,v,{name:x.name,visible:x.visible,actualDuration:{ticks:x.duration},notes:x.name==='Chord'?x.notes:undefined})})}
 const original=snapshot();
 const score={selection:{select(n){selected=n;return true}},
 startCmd(){backup=snapshot();calls.push('start')},endCmd(rollback){ends.push(rollback);if(rollback)restore(backup)},newCursor(){
  let tick=0,dur=480;return {staffIdx:1,voice:0,get tick(){return tick},get segment(){return tick<1920?{tick}:null},get element(){return grid.get(tick+':'+this.voice)||null},
  rewindToTick(t){tick=t},next(){const values=[...grid.keys()].map(k=>k.split(':').map(Number)).filter(x=>x[1]===this.voice&&x[0]>tick).map(x=>x[0]);tick=values.length?Math.min(...values):1920;return tick<1920},
  setDuration(num,den){dur=num/den*1920},addRest(){set(tick,this.voice,{name:'Rest',visible:true,actualDuration:{ticks:dur}})},
  addNote(p,add){const key=tick+':'+this.voice;let el=grid.get(key);if(!add||!el||el.name!=='Chord')el=set(tick,this.voice,{name:'Chord',notes:[],actualDuration:{ticks:dur}});const n={pitch:p,parent:el};el.notes.push(n);tick+=dur}
 }}};
 const api={up:1,down:2,removeElement(el){grid.set(el.parent.tick+':'+(el.track-4),{name:'Rest',visible:true,parent:el.parent,track:el.track,actualDuration:el.actualDuration})},
 cmd(action){calls.push(action);if(action==='tie'){const chord=selected.parent,tick=chord.parent.tick+chord.actualDuration.ticks,v=chord.track-4,dest=grid.get(tick+':'+v),n=dest&&dest.notes&&dest.notes.find(x=>x.pitch===selected.pitch);if(n){const tie={startNote:selected,endNote:n};selected.tieForward=tie;n.tieBack=tie}}},verify(){return true}};
 const windows=[0,240,480,720,1920],pitches=[[],[47],[47,55],[47,55,59]];
 const events=windows.slice(0,-1).map((tick,i)=>({tick,durationTicks:windows[i+1]-tick,voice:0,notes:pitches[i].map(p=>({pitch:p,tieStart:i<3,tieStop:(p===47&&i>1)||(p===55&&i>2)}))}));
 events.push({tick:0,durationTicks:1920,voice:1,notes:[{pitch:40,tieStart:false,tieStop:false}]});
 return {score,api,grid,ends,calls,operations:[{globalStaff:1,startTick:0,endTick:1920,events}],snapshot,original};
}
let f=fixture();const adapter=scope.createNotationDirect();adapter.apply(f.score,f.operations,f.api);assert.deepEqual(f.ends,[false]);assert.equal(f.calls.filter(x=>x==='start').length,1);assert.equal(f.grid.get('480:0').notes[0].userVelocity,72);assert.equal(f.grid.get('240:2').visible,false);
f=fixture();f.api.cmd=()=>{};assert.throws(()=>adapter.apply(f.score,f.operations,f.api),/Haltebogen/);assert.deepEqual(f.ends,[true]);assert.deepEqual(f.snapshot(),f.original);
f=fixture();f.api.verify=()=>false;assert.throws(()=>adapter.apply(f.score,f.operations,f.api),/vollständigen Partitur/);assert.deepEqual(f.ends,[true]);assert.deepEqual(f.snapshot(),f.original);
f=fixture();f.grid.get('480:1').notes[0].tpc2=16;assert.throws(()=>adapter.apply(f.score,f.operations,f.api),/Transponierende/);assert.deepEqual(f.ends,[]);assert.deepEqual(f.calls,[]);
console.log('Direct adapter: note/chord/rest rewrite, ties, velocity, hidden obsolete rests, one transaction, rollback on tie/whole-score failure, preflight exclusion: PASS (native API substitutes)');
