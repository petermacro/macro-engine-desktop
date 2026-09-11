const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'forexfactory', 'nfp_release_snapshot.json');
const expected = [
  ['2025-09-05', 22, 75, 79],
  ['2025-11-20', 119, 53, -4],
  ['2025-12-16', -105, null, 108],
  ['2025-12-16', 64, 51, -105],
  ['2026-01-09', 50, 66, 56],
  ['2026-02-11', 130, 66, 48],
  ['2026-03-06', -92, 58, 126],
  ['2026-04-03', 178, 65, -133],
  ['2026-05-08', 115, 65, 185],
  ['2026-06-05', 172, 85, 179],
  ['2026-07-02', 57, 114, 129],
  ['2026-08-07', -23, 85, 20],
  ['2026-09-04', 162, 55, 21],
];

function fail(msg){ console.error(`FAIL: ${msg}`); process.exit(1); }
if(!fs.existsSync(file)) fail('Bundled Forex Factory snapshot is missing.');
let rows;
try { rows = JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e) { fail(`Invalid JSON: ${e.message}`); }
if(!Array.isArray(rows)) fail('Snapshot root must be an array.');
if(rows.length !== expected.length) fail(`Expected ${expected.length} rows, found ${rows.length}.`);

rows.forEach((r,i)=>{
  const [date,actual,forecast,previous]=expected[i];
  if(r.date!==date) fail(`Row ${i+1} date mismatch: ${r.date} != ${date}`);
  if(Number(r.actual)!==actual) fail(`Row ${i+1} actual mismatch.`);
  if((r.forecast===null?null:Number(r.forecast))!==forecast) fail(`Row ${i+1} forecast mismatch.`);
  if(Number(r.previous)!==previous) fail(`Row ${i+1} previous mismatch.`);
  if(i===2 && r.dataLabel!=='Oct Data') fail('Oct Data label missing.');
  if(i===3 && r.dataLabel!=='Nov Data') fail('Nov Data label missing.');
});

const latest = rows[rows.length-1];
const surprise = latest.actual - latest.forecast;
if(surprise !== 107) fail(`Latest surprise expected +107K, got ${surprise}K.`);

console.log(JSON.stringify({
  ok:true,
  source:'Forex Factory verified release-vintage snapshot',
  rows:rows.length,
  latest:{date:latest.date,actual:latest.actual,forecast:latest.forecast,previous:latest.previous,surprise},
  duplicateReleaseDateRows:rows.filter(r=>r.date==='2025-12-16').length,
  message:'Historical NFP snapshot validation PASS; no network request made.'
},null,2));
