const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
let autoUpdater;
try { autoUpdater = require('electron-updater').autoUpdater; } catch { autoUpdater = null; }
const path = require('path');
const fs = require('fs');
const https = require('https');
const {
  assertAllowedSourceUrl,
  getRequestLimits
} = require('./security.cjs');
const initSqlJs = require('sql.js');
const XLSX = require('xlsx');
const { jsPDF } = require('jspdf');

let db; let SQL;
const userData=()=>app.getPath('userData');
const dbPath=()=>path.join(userData(),'macro-engine.sqlite');
const settingsPath=()=>path.join(userData(),'settings.json');
const FF_PAGE='https://www.forexfactory.com/calendar';
const FF_JSON='https://nfs.faireconomy.media/ff_calendar_thisweek.json';
const FF_SNAPSHOT=path.join(__dirname,'..','data','forexfactory','nfp_release_snapshot.json');
const FF_CACHE=()=>path.join(userData(),'forexfactory-weekly-cache.json');
const FF_RETRY=()=>path.join(userData(),'forexfactory-retry.json');
const FF_CACHE_TTL_MS=10*60*1000;
const FF_RETRY_TTL_MS=10*60*1000;
const BLS_PAGE='https://www.bls.gov/ces/';
const BLS_FILE='https://download.bls.gov/pub/time.series/CE/ce.data.00a.TotalNonfarm.Employment';
const NFP_ID='nonfarm-payrolls';
const NFP_SERIES='FOREXFACTORY-NFP';
const CATALOG_BUNDLED=path.join(__dirname,'..','data','catalog.json');
const CATALOG_CACHE=()=>path.join(userData(),'catalog-cache.json');
const CONTENT_RETRY=()=>path.join(userData(),'content-retry.json');
const CONTENT_CACHE_TTL_MS=24*60*60*1000;

function requestText(url, options={}){
  return new Promise((resolve,reject)=>{
    let parsedUrl;

    try {
      parsedUrl = assertAllowedSourceUrl(url);
    } catch (e) {
      reject(e);
      return;
    }

    const limits = getRequestLimits(options);

    const req = https.request(parsedUrl,{
      method:options.method||'GET',
      headers:{
        'User-Agent':'Mozilla/5.0 MacroEngineDesktop/13.1',
        Accept:'application/json,text/csv,text/plain,*/*;q=0.8',
        ...(options.headers||{})
      }
    },res=>{
      let body='';
      let receivedBytes=0;
      let tooLarge=false;

      res.setEncoding('utf8');

      res.on('data',d=>{
        if(tooLarge)return;

        receivedBytes += Buffer.byteLength(d,'utf8');

        if(receivedBytes > limits.maxResponseBytes){
          tooLarge=true;
          req.destroy(new Error('Response exceeds the configured security size limit.'));
          return;
        }

        body+=d;
      });

      res.on('end',()=>{
        if(tooLarge)return;

        if(res.statusCode>=200&&res.statusCode<300){
          resolve(body);
        }else{
          reject(Object.assign(
            new Error(`HTTP ${res.statusCode}: ${body.slice(0,300)}`),
            {statusCode:res.statusCode}
          ));
        }
      });
    });

    req.on('error',reject);

    req.setTimeout(
      limits.timeoutMs,
      ()=>req.destroy(new Error('Request timeout'))
    );

    if(options.body)req.write(options.body);
    req.end();
  });
}function clean(v){return v===null||v===undefined?'':String(v).trim();}
function parseNum(v){if(v===null||v===undefined||v==='')return null;if(typeof v==='number')return Number.isFinite(v)?v:null;const n=Number(String(v).replace(/,/g,'').replace(/%/g,''));return Number.isFinite(n)?n:null;}
function fmtK(v){if(!Number.isFinite(v))return '—';return `${v>0?'+':''}${Math.round(v).toLocaleString()}K`;}
function normalizeDate(v){const d=new Date(v);return Number.isNaN(d.getTime())?String(v).slice(0,10):d.toISOString().slice(0,10);}
function surprise(actual,forecast){if(!Number.isFinite(actual)||!Number.isFinite(forecast))return{value:null,text:'—'};const v=actual-forecast;return{value:v,text:fmtK(v)};}
function rowsToObjects(result){if(!result||!result.length)return[];const cols=result[0].columns;return result[0].values.map(r=>Object.fromEntries(cols.map((c,i)=>[c,r[i]])));}
function persistDb(){fs.writeFileSync(dbPath(),Buffer.from(db.export()));}
function initDb(){let recreate=false;try{const info=rowsToObjects(db.exec(`PRAGMA table_info(macro_releases)`));recreate=!info.some(x=>x.name==='release_label');}catch{recreate=true;}if(recreate)db.run(`DROP TABLE IF EXISTS macro_releases`);db.run(`CREATE TABLE IF NOT EXISTS macro_releases(indicator_id TEXT,country TEXT,source_id TEXT,series_id TEXT,date TEXT,release_label TEXT,actual REAL,forecast REAL,previous REAL,actual_text TEXT,forecast_text TEXT,previous_text TEXT,surprise REAL,surprise_text TEXT,source_url TEXT,fetched_at TEXT,PRIMARY KEY(indicator_id,country,date,release_label));`);db.run(`CREATE TABLE IF NOT EXISTS source_overrides(indicator_id TEXT PRIMARY KEY,source_id TEXT,source_name TEXT,source_url TEXT,series_id TEXT,reference_url TEXT,forecast_url TEXT,updated_at TEXT);`);db.run(`CREATE TABLE IF NOT EXISTS app_content(key TEXT PRIMARY KEY,json TEXT,source TEXT,updated_at TEXT);`);seedCatalog();persistDb();}
function loadDb(){try{if(fs.existsSync(dbPath())){db=new SQL.Database(fs.readFileSync(dbPath()));initDb();return}}catch{}db=new SQL.Database();initDb();}
function validateCatalog(c){
  return !!(c&&Array.isArray(c.countries)&&Array.isArray(c.sections)&&c.sections.length>=25&&c.sections.every(s=>Array.isArray(s.indicators)));
}
function readBundledCatalog(){if(!fs.existsSync(CATALOG_BUNDLED))throw new Error('Bundled catalog is missing.');const c=JSON.parse(fs.readFileSync(CATALOG_BUNDLED,'utf8'));if(!validateCatalog(c))throw new Error('Bundled catalog is invalid.');return c;}
function seedCatalog(){try{const rows=rowsToObjects(db.exec(`SELECT key,json FROM app_content WHERE key='catalog' LIMIT 1`));if(rows[0]?.json)return;const c=readBundledCatalog();db.run(`INSERT OR REPLACE INTO app_content(key,json,source,updated_at) VALUES (?,?,?,?)`,['catalog',JSON.stringify(c),'bundled',new Date().toISOString()]);}catch(e){console.error('Catalog seed failed:',e.message);}}
function getCatalog(){try{const row=rowsToObjects(db.exec(`SELECT json,source,updated_at AS updatedAt FROM app_content WHERE key='catalog' LIMIT 1`))[0];if(row?.json){const c=JSON.parse(row.json);if(validateCatalog(c))return{catalog:c,source:row.source,updatedAt:row.updatedAt};}}catch{}const c=readBundledCatalog();return{catalog:c,source:'bundled',updatedAt:null};}
function saveCatalog(c,source){if(!validateCatalog(c))throw new Error('Remote content pack is invalid.');const now=new Date().toISOString();db.run(`INSERT OR REPLACE INTO app_content(key,json,source,updated_at) VALUES (?,?,?,?)`,['catalog',JSON.stringify(c),source,now]);writeJsonFile(CATALOG_CACHE(),{catalog:c,source,updatedAt:now});persistDb();return{catalog:c,source,updatedAt:now};}
async function syncCatalog(){const settings=readJsonFile(settingsPath())||{};const url=clean(settings.contentPackUrl||process.env.MACRO_ENGINE_CONTENT_URL);if(!url)return{ok:false,configured:false,error:'Content Pack URL is not configured.'};const now=Date.now();const retry=readJsonFile(CONTENT_RETRY());if(retry?.until&&now<retry.until)return{ok:false,configured:true,rateLimited:true,error:retry.error||'Content source temporarily rate-limited.'};try{const raw=await requestText(url);const c=JSON.parse(raw);const saved=saveCatalog(c,url);writeJsonFile(CONTENT_RETRY(),{until:0,error:''});return{ok:true,configured:true,...saved};}catch(e){if(e?.statusCode===429)writeJsonFile(CONTENT_RETRY(),{until:now+60*60*1000,error:e.message});return{ok:false,configured:true,error:e.message,statusCode:e?.statusCode||0};}}
function loadSnapshot(){if(!fs.existsSync(FF_SNAPSHOT))throw new Error('Bundled Forex Factory NFP snapshot is missing.');const x=JSON.parse(fs.readFileSync(FF_SNAPSHOT,'utf8'));if(!Array.isArray(x)||x.length<12)throw new Error('Bundled Forex Factory NFP snapshot is incomplete.');return x;}
function decorate(events){return events.map(e=>{const actual=parseNum(e.actual),forecast=parseNum(e.forecast),previous=parseNum(e.previous);const s=surprise(actual,forecast);return{date:normalizeDate(e.date),releaseLabel:clean(e.dataLabel)||'',actual,forecast,previous,actualText:fmtK(actual),forecastText:fmtK(forecast),previousText:fmtK(previous),surprise:s.value,surpriseText:s.text,sourceUrl:FF_PAGE,fetchedAt:new Date().toISOString()};}).filter(x=>Number.isFinite(x.actual)).sort((a,b)=>a.date.localeCompare(b.date)||a.releaseLabel.localeCompare(b.releaseLabel));}
function readJsonFile(file){try{if(!fs.existsSync(file))return null;return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return null;}}
function writeJsonFile(file,value){try{fs.writeFileSync(file,JSON.stringify(value,null,2));}catch{}}
async function fetchFfLive(){
  const now=Date.now();
  const retry=readJsonFile(FF_RETRY());
  if(retry?.until && now<retry.until){
    const cached=readJsonFile(FF_CACHE());
    if(cached?.raw){const arr=Array.isArray(cached.raw)?cached.raw:[];const nfp=arr.filter(x=>String(x.country||'').toUpperCase()==='USD'&&/non.?farm employment change/i.test(String(x.title||'')));return{events:nfp,rawCount:arr.length,fromCache:true,rateLimited:true};}
    throw Object.assign(new Error(retry.error||'Forex Factory live feed temporarily rate-limited.'),{statusCode:429});
  }
  const cached=readJsonFile(FF_CACHE());
  if(cached?.fetchedAt && now-Date.parse(cached.fetchedAt)<FF_CACHE_TTL_MS && Array.isArray(cached.raw)){
    const arr=cached.raw;const nfp=arr.filter(x=>String(x.country||'').toUpperCase()==='USD'&&/non.?farm employment change/i.test(String(x.title||'')));return{events:nfp,rawCount:arr.length,fromCache:true};
  }
  try{
    const raw=await requestText(FF_JSON);const json=JSON.parse(raw);const arr=Array.isArray(json)?json:[];
    writeJsonFile(FF_CACHE(),{fetchedAt:new Date().toISOString(),raw:arr});
    writeJsonFile(FF_RETRY(),{until:0,error:''});
    const nfp=arr.filter(x=>String(x.country||'').toUpperCase()==='USD'&&/non.?farm employment change/i.test(String(x.title||'')));
    return{events:nfp,rawCount:arr.length,fromCache:false};
  }catch(e){
    if(e?.statusCode===429){
      writeJsonFile(FF_RETRY(),{until:now+FF_RETRY_TTL_MS,error:e.message});
      const c=readJsonFile(FF_CACHE());
      if(c?.raw && Array.isArray(c.raw)){const arr=c.raw;const nfp=arr.filter(x=>String(x.country||'').toUpperCase()==='USD'&&/non.?farm employment change/i.test(String(x.title||'')));return{events:nfp,rawCount:arr.length,fromCache:true,rateLimited:true};}
    }
    throw e;
  }
}
async function fetchNfp(){const snapshot=decorate(loadSnapshot());const saved=typeof db!=='undefined'&&db?getSaved().map(r=>({date:r.date,dataLabel:r.releaseLabel,actual:r.actual,forecast:r.forecast,previous:r.previous})):[];let live=null;let remoteError='';try{live=await fetchFfLive();}catch(e){remoteError=e?.message||String(e);}
  // The official FF machine-readable export is weekly. It is merged only when it
  // contains an actual NFP observation; otherwise the verified historical snapshot
  // remains authoritative for the 12-month release window.
  let merged=decorate([...snapshot,...saved]);
  if(live?.events?.length){for(const e of live.events){if(!Number.isFinite(parseNum(e.actual)))continue;const row=decorate([e])[0];const idx=merged.findIndex(x=>x.date===row.date&&x.releaseLabel===row.releaseLabel);if(idx>=0)merged[idx]=row;else merged.push(row);}}
  merged.sort((a,b)=>a.date.localeCompare(b.date)||a.releaseLabel.localeCompare(b.releaseLabel));
  // Keep the rolling 12-calendar-month window. Because Oct-2025 was delayed,
  // this window legitimately contains 13 NFP release rows.
  const cutoff=new Date();cutoff.setMonth(cutoff.getMonth()-12);const cutoffStr=cutoff.toISOString().slice(0,10);
  merged=merged.filter(x=>x.date>=cutoffStr).slice(-13);
  const hasLive=live?.events?.some(x=>Number.isFinite(parseNum(x.actual)));
  const transport=hasLive?(live.fromCache?'forexfactory-live-json-cache+snapshot':'forexfactory-live-json+snapshot'):(remoteError?.includes('429')?'forexfactory-verified-snapshot (live rate-limited)':'forexfactory-verified-snapshot');
  return{releases:merged,transport,remoteOk:!remoteError,remoteError,remoteEvents:live?.rawCount||0,rateLimited:!!live?.rateLimited};}
function saveReleases(releases){const stmt=db.prepare(`INSERT OR REPLACE INTO macro_releases(indicator_id,country,source_id,series_id,date,release_label,actual,forecast,previous,actual_text,forecast_text,previous_text,surprise,surprise_text,source_url,fetched_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);const now=new Date().toISOString();for(const r of releases)stmt.run([NFP_ID,'US','forexfactory',NFP_SERIES,r.date,r.releaseLabel,r.actual,r.forecast,r.previous,r.actualText,r.forecastText,r.previousText,r.surprise,r.surpriseText,FF_PAGE,now]);stmt.free();persistDb();return true;}
function getSaved(){return rowsToObjects(db.exec(`SELECT date,release_label AS releaseLabel,actual,forecast,previous,actual_text AS actualText,forecast_text AS forecastText,previous_text AS previousText,surprise,surprise_text AS surpriseText,source_url AS sourceUrl,fetched_at AS fetchedAt FROM macro_releases WHERE indicator_id='${NFP_ID}' AND country='US' ORDER BY date ASC, release_label ASC`));}
function getOverride(){return rowsToObjects(db.exec(`SELECT indicator_id AS indicatorId,source_id AS sourceId,source_name AS sourceName,source_url AS sourceUrl,series_id AS seriesId,reference_url AS referenceUrl,forecast_url AS forecastUrl,updated_at AS updatedAt FROM source_overrides WHERE indicator_id='${NFP_ID}' LIMIT 1`))[0]||null;}
function testFf(){try{const snap=decorate(loadSnapshot());return{ok:true,snapshot:true,history:snap.length,latest:snap.at(-1),source:'Forex Factory verified snapshot',remote:undefined};}catch(e){return{ok:false,error:e.message};}}

ipcMain.handle('catalog:get',()=>{const r=getCatalog();return{ok:true,...r};});
ipcMain.handle('catalog:sync',async()=>syncCatalog());
ipcMain.handle('catalog:reset',()=>{try{const c=readBundledCatalog();const r=saveCatalog(c,'bundled');return{ok:true,...r};}catch(e){return{ok:false,error:e.message};}});
ipcMain.handle('ff:test',async()=>{const base=testFf();try{const live=await fetchFfLive();return{...base,remote:true,remoteEvents:live.rawCount,liveNfpEvents:live.events.length,transport:live.events.some(x=>Number.isFinite(parseNum(x.actual)))?'live JSON + snapshot':'official weekly JSON reachable; historical snapshot used'};}catch(e){return{...base,remote:false,transport:'official verified snapshot',error:`Weekly FF JSON unavailable: ${e.message}`};}});
ipcMain.handle('series:get',async()=>{try{const ov=getOverride();const sourceId=ov?.sourceId||'forexfactory';if(sourceId!=='forexfactory')throw new Error('This NFP test build is locked to Forex Factory release-vintage data.');const data=await fetchNfp();saveReleases(data.releases);const releases=getSaved().slice(-13);const latest=releases.at(-1)||null;return{ok:true,rows:releases.map(r=>({date:r.date,value:r.actual})),releases,latest,sourceId:'forexfactory',sourceName:'Forex Factory — Calendar',sourceUrl:FF_JSON,referenceUrl:FF_PAGE,fetchedAt:new Date().toISOString(),transport:data.transport,remoteOk:data.remoteOk,remoteError:data.remoteError};}catch(e){return{ok:false,error:e.message};}});
ipcMain.handle('source:get-overrides',()=>{const r=getOverride();return r?[r]:[];});
ipcMain.handle('source:save-override',(_e,p)=>{const now=new Date().toISOString();db.run(`INSERT OR REPLACE INTO source_overrides(indicator_id,source_id,source_name,source_url,series_id,reference_url,forecast_url,updated_at) VALUES (?,?,?,?,?,?,?,?)`,[NFP_ID,'forexfactory','Forex Factory — Calendar',FF_JSON,NFP_SERIES,FF_PAGE,'',now]);persistDb();return{ok:true,updatedAt:now};});
ipcMain.handle('source:reset-override',()=>{db.run(`DELETE FROM source_overrides WHERE indicator_id='${NFP_ID}'`);persistDb();return{ok:true};});
ipcMain.handle('data:refresh-all',async()=>{try{const d=await fetchNfp();saveReleases(d.releases);return{ok:true,count:d.releases.length,transport:d.transport,remoteOk:d.remoteOk,remoteError:d.remoteError};}catch(e){return{ok:false,error:e.message};}});
ipcMain.handle('export:xlsx',async(_e,p)=>{const r=await dialog.showSaveDialog({defaultPath:`${p.filename||'nfp-history'}.xlsx`,filters:[{name:'Excel Workbook',extensions:['xlsx']}]});if(r.canceled)return{canceled:true};const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(p.rows||[]),'NFP');XLSX.writeFile(wb,r.filePath);return{ok:true,path:r.filePath};});
ipcMain.handle('export:pdf',async(_e,p)=>{const r=await dialog.showSaveDialog({defaultPath:`${p.filename||'nfp-report'}.pdf`,filters:[{name:'PDF',extensions:['pdf']}]});if(r.canceled)return{canceled:true};const doc=new jsPDF();doc.setFontSize(18);doc.text(p.title||'Nonfarm Payrolls (NFP)',14,18);doc.setFontSize(9);let y=28;for(const row of(p.rows||[])){doc.text(`${row.date||''} ${row.releaseLabel||''}    ${row.actualText||''}    Forecast ${row.forecastText||'—'}    Previous ${row.previousText||'—'}    Surprise ${row.surpriseText||'—'}`,14,y);y+=5;if(y>280){doc.addPage();y=18}}doc.save(r.filePath);return{ok:true,path:r.filePath};});
ipcMain.handle('open-external',async(_e,url)=>{if(/^https?:\/\//i.test(url))await shell.openExternal(url);});
ipcMain.handle('settings:get',()=>{try{return fs.existsSync(settingsPath())?JSON.parse(fs.readFileSync(settingsPath(),'utf8')):{refreshMinutes:60,contentPackUrl:'',appUpdateUrl:''};}catch{return{refreshMinutes:60,contentPackUrl:'',appUpdateUrl:''};}});
ipcMain.handle('settings:save',(_e,s)=>{fs.writeFileSync(settingsPath(),JSON.stringify(s,null,2));return{ok:true};});
ipcMain.handle('shortcut:create',async()=>{try{const desktop=app.getPath('desktop');const shortcutPath=path.join(desktop,'Macro Engine.lnk');if(!app.isPackaged)return{ok:false,error:'Build the Windows installer with npm run dist.'};shell.writeShortcutLink(shortcutPath,'create',{target:process.execPath,args:[],description:'Macro Engine Desktop',appUserModelId:'com.macroengine.desktop'});return{ok:true,path:shortcutPath};}catch(e){return{ok:false,error:e.message}}});
ipcMain.handle('app-update:check',()=>checkAppUpdate());
ipcMain.handle('app-update:install',()=>{if(autoUpdater){autoUpdater.quitAndInstall();return{ok:true};}return{ok:false,error:'Automatic updater is unavailable.'};});
ipcMain.handle('app-update:version',()=>updateState({state:app.isPackaged?'idle':'dev'}));


function parseGithubRepo(value){
  const raw=clean(value); if(!raw) return null;
  const m=raw.match(/github\.com[/:]([^/]+)\/([^/#]+?)(?:\.git)?(?:[/?#]|$)/i);
  if(!m) return null;
  return {owner:m[1],repo:m[2]};
}
function updateState(extra={}){return {supported:!!(autoUpdater&&app.isPackaged),version:app.getVersion(),...extra};}
function configureAutoUpdater(){
  if(!autoUpdater||!app.isPackaged) return;
  autoUpdater.autoDownload=true;
  autoUpdater.autoInstallOnAppQuit=true;
  autoUpdater.allowDowngrade=false;
  autoUpdater.on('checking-for-update',()=>BrowserWindow.getAllWindows().forEach(w=>w.webContents.send('app-update:status',updateState({state:'checking'}))));
  autoUpdater.on('update-available',info=>BrowserWindow.getAllWindows().forEach(w=>w.webContents.send('app-update:status',updateState({state:'available',info}))));
  autoUpdater.on('update-not-available',info=>BrowserWindow.getAllWindows().forEach(w=>w.webContents.send('app-update:status',updateState({state:'up-to-date',info}))));
  autoUpdater.on('download-progress',p=>BrowserWindow.getAllWindows().forEach(w=>w.webContents.send('app-update:status',updateState({state:'downloading',progress:Math.round(p.percent)}))));
  autoUpdater.on('update-downloaded',info=>BrowserWindow.getAllWindows().forEach(w=>w.webContents.send('app-update:status',updateState({state:'downloaded',info}))));
  autoUpdater.on('error',err=>BrowserWindow.getAllWindows().forEach(w=>w.webContents.send('app-update:status',updateState({state:'error',error:err?.message||String(err)}))));
}
async function checkAppUpdate(){
  if(!autoUpdater||!app.isPackaged)return updateState({state:'unsupported'});
  const settings=readJsonFile(settingsPath())||{};
  const repo=parseGithubRepo(settings.appUpdaterUrl||process.env.MACRO_ENGINE_UPDATE_REPO||'https://github.com/petermacro/macro-engine-desktop');
  if(!repo)return updateState({state:'not-configured',error:'Application update repository is not configured.'});
  try{
    autoUpdater.setFeedURL({provider:'github',owner:repo.owner,repo:repo.repo,private:false});
    const r=await autoUpdater.checkForUpdates();
    return updateState({state:r?.updateInfo?.version&&r.updateInfo.version!==app.getVersion()?'available':'up-to-date',availableVersion:r?.updateInfo?.version||null,repo:`${repo.owner}/${repo.repo}`});
  }catch(e){return updateState({state:'error',error:e?.message||String(e),repo:`${repo.owner}/${repo.repo}`});}
}
function scheduleAutoUpdate(){
  if(!autoUpdater||!app.isPackaged)return;
  setTimeout(()=>checkAppUpdate(),15000);
  setInterval(()=>checkAppUpdate(),30*60*1000);
}

function createWindow(){const win=new BrowserWindow({width:1600,height:1000,minWidth:1200,minHeight:760,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false}});if(!app.isPackaged)win.loadURL('http://127.0.0.1:5173');else win.loadFile(path.join(__dirname,'..','dist','index.html'));}
app.whenReady().then(async()=>{SQL=await initSqlJs({locateFile:file=>path.join(__dirname,'..','node_modules','sql.js','dist',file)});loadDb();configureAutoUpdater();createWindow();scheduleAutoUpdate();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
