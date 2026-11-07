// MuseScore 4.7.6 may return the original when opening a separate process.
// Result metadata must never be stamped onto that original score.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=fs.readFileSync(process.env.NEW_SCORE_HANDOFF_APP||'tests/AI-Notation-Studio-App-prelude-recovery.qml','utf8');
const a=app.indexOf('    function openCompactScore()'),b=app.indexOf('\n    Dialog {',a);
const source=app.slice(a,b);
for(const handoff of [true,false]){
 const original={tags:{original:'retained'},metaTag(){return ''},setMetaTag(k,v){this.tags[k]=v},is(other){return this===other}};
 const output={tags:{},setMetaTag(k,v){this.tags[k]=v},is(other){return this===other}};
 const writes={},ctx={busy:false,statusText:'',compositionJson:'{}',compositionJob:null,curScore:original,
  compact:{score:{encode(){return 'CS1-SOURCE'}},xml:{convert(){return {xml:'<score-partwise/>',warnings:[]}}}},
  compactFile:{},Qt:{resolvedUrl:s=>s},isCompactResult:()=>true,workflowApplyCheck(){},
  fileUrlToLocalPath:s=>s,writeVerifiedCompactFile:(path,text)=>writes[path]=text,
  readScore(){return handoff?original:output},compositionRecordTag:()=> 'record',scoreMemoryTagName:()=> 'memory',
  currentScoreMemoryObject:()=>({}),stampScoreComposition(score){score.tags.stamped=true},archiveComposition(){},logEvent(){}};
 vm.createContext(ctx);vm.runInContext(source+';this.receipt=openCompactScore();',ctx);
 assert.equal(ctx.receipt.handedOff,handoff);
 assert.deepEqual(original.tags,{original:'retained'},'source got result metadata');
 assert.equal(Object.keys(writes).length,2,'XML and lossless CS1 sidecar must remain available');
 if(handoff){assert.equal(ctx.receipt.score,null);assert(ctx.statusText.includes('übergeben'));}
 else{assert.equal(ctx.receipt.score,output);assert.equal(output.tags['AI-Notation-Studio-Source-CS1'],'CS1-SOURCE');assert(output.tags.stamped);}
}
console.log('New-window handoff PASS: original metadata protected; real destination stamped only when its identity is distinct');
