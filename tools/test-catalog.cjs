const fs=require('fs');
const path=require('path');
const file=path.join(__dirname,'..','data','catalog.json');
const c=JSON.parse(fs.readFileSync(file,'utf8'));
const indicators=c.sections.flatMap(s=>s.indicators||[]);
const engines=new Set(c.sections.map(s=>s.engine));
const ok=Array.isArray(c.countries)&&c.countries.length>=8&&c.sections.length>=25&&engines.has('economy')&&engines.has('policy')&&engines.has('market')&&indicators.length>=90&&indicators.some(i=>i.id==='nonfarm-payrolls');
console.log(JSON.stringify({ok,countries:c.countries.length,sections:c.sections.length,indicators:indicators.length,engines:[...engines],nfp:indicators.find(i=>i.id==='nonfarm-payrolls')?.name||null},null,2));
process.exit(ok?0:1);
