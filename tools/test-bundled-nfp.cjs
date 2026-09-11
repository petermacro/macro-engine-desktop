const fs=require('fs');
const path=require('path');
const file=path.join(__dirname,'..','data','bls','ce.data.00a.TotalNonfarm.Employment');
const text=fs.readFileSync(file,'utf8');
const rows=[];
for(const line of text.split(/\r?\n/)){
  const p=line.trim().split(/\s+/);
  if(p.length<4||p[0]!=='CES0000000001'||!/^\d{4}$/.test(p[1])||!/^M\d{2}$/.test(p[2]))continue;
  const value=Number(p[3]); if(!Number.isFinite(value))continue;
  rows.push({year:Number(p[1]),month:Number(p[2].slice(1)),value});
}
rows.sort((a,b)=>a.year-b.year||a.month-b.month);
const changes=[];
for(let i=1;i<rows.length;i++){
  const a=rows[i],b=rows[i-1];
  changes.push({date:`${a.year}-${String(a.month).padStart(2,'0')}`,nfp:(a.value-b.value)});
}
console.log(JSON.stringify({file,levels:rows.length,last12:changes.slice(-12),latest:changes.at(-1)},null,2));
