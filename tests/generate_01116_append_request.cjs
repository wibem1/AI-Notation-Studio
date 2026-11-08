// Synthetic test only: no user composition and no provider request.
const fs=require('fs');
const text=['CS1','S {"t":"ANS-TEST-Append","k":"a minor","m":"4/4","b":{"v":132}}'];
for(const [id,name,note] of [
 ['violin','Violine','G5:w'],
 ['piano','Klavier','C5:w'],
 ['piano_2','Klavier','A2:w']
]) {
 text.push('P '+JSON.stringify({i:id,n:name}));
 text.push('1/1 '+note);
 text.push('2/1 '+note);
}
fs.writeFileSync('/tmp/ans-01116-append-request.json',JSON.stringify({raw:text.join('\n')}));
console.log('Synthetic continuation: 2 measures × 3 parts');
