import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Activity,ArrowLeft,BarChart3,BookOpen,ChevronDown,ChevronRight,CloudDownload,Database,ExternalLink,Globe2,Landmark,LayoutDashboard,Menu,RefreshCw,Search,Settings2,ShieldCheck,TrendingDown,TrendingUp,WalletCards} from 'lucide-react';
import {countries as bundledCountries,engineMeta as bundledEngineMeta,sections as bundledSections,EngineId,Indicator,Section} from './config';
import './styles.css';

type Release={date:string;releaseLabel?:string;actual:number|null;forecast:number|null;previous:number|null;actualText?:string;forecastText?:string;previousText?:string;surprise:number|null;surpriseText?:string};

type AppView={country:string;engine:EngineId;indicator?:string};

const engineOrder:EngineId[]=['economy','policy','market'];
type Catalog={countries:typeof bundledCountries;sections:Section[];engineMeta:typeof bundledEngineMeta;source?:string;updatedAt?:string|null};
const ffPage='https://www.forexfactory.com/calendar';
const ffJson='https://nfs.faireconomy.media/ff_calendar_thisweek.json';

function App(){
 const [catalog,setCatalog]=useState<Catalog>({countries:bundledCountries,sections:bundledSections,engineMeta:bundledEngineMeta,source:'bundled'});
 const [view,setView]=useState<AppView>({country:'US',engine:'economy'});
 const [search,setSearch]=useState('');
 const [collapsed,setCollapsed]=useState<Record<number,boolean>>({});
 const [releases,setReleases]=useState<Release[]>([]);
 const [status,setStatus]=useState('Ready');
 const [loading,setLoading]=useState(false);
 const [refreshMinutes,setRefreshMinutes]=useState(60);
 const [diagnostic,setDiagnostic]=useState<any>(null);
 const [sidebar,setSidebar]=useState(true);
 const [showSettings,setShowSettings]=useState(false);
 const [contentPackUrl,setContentPackUrl]=useState('');
 const [appUpdateUrl,setAppUpdateUrl]=useState('');
 const [syncMessage,setSyncMessage]=useState('');
 const [appUpdate,setAppUpdate]=useState<any>(null);

 useEffect(()=>{window.macroAPI.getSettings?.().then(s=>{if(s?.refreshMinutes)setRefreshMinutes(Number(s.refreshMinutes));if(s?.contentPackUrl)setContentPackUrl(String(s.contentPackUrl));if(s?.appUpdateUrl)setAppUpdateUrl(String(s.appUpdateUrl));}).catch(()=>{});window.macroAPI.getCatalog?.().then(r=>{if(r?.ok&&r.catalog){setCatalog({...r.catalog,source:r.source,updatedAt:r.updatedAt});if(r.source)setSyncMessage(`Catalog: ${r.source}`);}}).catch(()=>{});window.macroAPI.getAppUpdateVersion?.().then(setAppUpdate).catch(()=>{});const off=window.macroAPI.onAppUpdateStatus?.(setAppUpdate);return()=>off?.();},[]);
 useEffect(()=>{loadNfp();},[]);
 useEffect(()=>{const t=setInterval(loadNfp,Math.max(15,refreshMinutes)*60*1000);return()=>clearInterval(t)},[refreshMinutes]);

 async function loadNfp(){setLoading(true);try{const r=await window.macroAPI.getSeries({indicatorId:'nonfarm-payrolls',country:'US'});if(r?.ok){setReleases(r.releases||[]);setDiagnostic(r);setStatus(`${r.releases?.length||0} NFP releases • ${r.transport||'local cache'}`);}else setStatus(r?.error||'NFP data unavailable');}catch(e:any){setStatus(e?.message||'NFP data unavailable');}finally{setLoading(false)}}

 const selectedIndicator=useMemo(()=>view.indicator?catalog.sections.flatMap(s=>s.indicators).find(i=>i.id===view.indicator):undefined,[view.indicator,catalog.sections]);
 const visibleSections=useMemo(()=>catalog.sections.filter(s=>s.engine===view.engine && (search.trim()==='' || s.title.toLowerCase().includes(search.toLowerCase()) || s.indicators.some(i=>i.name.toLowerCase().includes(search.toLowerCase())))),[view.engine,search,catalog.sections]);

 function openIndicator(i:Indicator){setView(v=>({...v,indicator:i.id}));}
 function back(){setView(v=>({...v,indicator:undefined}));}
 async function syncContent(){setSyncMessage('Syncing content…');const r=await window.macroAPI.syncCatalog?.();if(r?.ok&&r.catalog){setCatalog({...r.catalog,source:r.source,updatedAt:r.updatedAt});setSyncMessage(`Updated ${new Date(r.updatedAt).toLocaleString()}`);}else setSyncMessage(r?.error||'Content sync unavailable');}
 async function saveSettings(){await window.macroAPI.saveSettings?.({refreshMinutes,contentPackUrl,appUpdateUrl});setShowSettings(false);setSyncMessage(contentPackUrl?'Content source saved':'Content source not configured');}
 async function checkAppUpdate(){const r=await window.macroAPI.checkAppUpdate?.();setAppUpdate(r);if(r?.state==='available')setSyncMessage(`App update ${r.availableVersion||''} found; downloading in background…`);else if(r?.state==='up-to-date')setSyncMessage('App is up to date');else if(r?.error)setSyncMessage(r.error);}
 async function installAppUpdate(){await window.macroAPI.installAppUpdate?.();}

 return <div className="appShell">
   {sidebar && <aside className="leftRail">
     <div className="brandBlock"><div className="brandBadge">M</div><div><div className="brandName">MACRO ENGINE</div><div className="brandSub">DESKTOP INTELLIGENCE TERMINAL</div></div></div>
     <div className="railSectionLabel">COUNTRIES</div>
     <div className="countryList">{catalog.countries.map(c=><button key={c.id} className={`countryItem ${view.country===c.id?'active':''}`} onClick={()=>setView({country:c.id,engine:'economy'})}><span className="countryFlag">{c.flag}</span><span><b>{c.name}</b><small>{c.region}</small></span><ChevronRight size={14}/></button>)}</div>
     <div className="railDivider"/>
     <div className="railSectionLabel">WORKSPACE</div>
     <div className="railAction active"><LayoutDashboard size={15}/> Macro Dashboard</div>
     <div className="railAction"><BookOpen size={15}/> Research Notes</div>
     <div className="railAction"><Database size={15}/> Local Data Store</div>
     <div className="railFooter"><ShieldCheck size={14}/><div><b>Production-style architecture</b><span>Live source + cache + local snapshot</span></div></div>
   </aside>}
   <main className="mainArea">
     <header className="topHeader"><button className="menuBtn" onClick={()=>setSidebar(x=>!x)}><Menu size={18}/></button><div className="titleBlock"><div className="crumb">{catalog.countries.find(c=>c.id===view.country)?.flag} {catalog.countries.find(c=>c.id===view.country)?.name} <span>/</span> {selectedIndicator?.name||catalog.engineMeta[view.engine].title}</div><h1>Macro Engine Desktop</h1></div><div className="headerRight"><div className={`syncPill ${diagnostic?.ok?'good':''}`}><span/>{loading?'SYNCING':'DATA READY'}<small>Auto {refreshMinutes}m</small></div><button className="roundBtn" onClick={syncContent} title="Sync content"><CloudDownload size={16}/></button><button className="roundBtn" onClick={()=>setShowSettings(true)} title="Update settings"><Settings2 size={16}/></button><button className="roundBtn" onClick={loadNfp} title="Refresh NFP"><RefreshCw size={16}/></button></div></header>
     {selectedIndicator ? <IndicatorPage indicator={selectedIndicator} engine={view.engine} releases={releases} loading={loading} diagnostic={diagnostic} onBack={back} onRefresh={loadNfp}/> : <>
       <section className="engineBar">{engineOrder.map(e=><button key={e} className={`engineTab ${e} ${view.engine===e?'selected':''}`} onClick={()=>setView(v=>({...v,engine:e}))}><span className="engineIcon">{catalog.engineMeta[e].icon}</span><div><small>{catalog.engineMeta[e].layer}</small><b>{catalog.engineMeta[e].title}</b><em>{catalog.engineMeta[e].subtitle}</em></div><ChevronRight size={16}/></button>)}</section>
       <section className="dashboardHead"><div><span className="goldEyebrow">{catalog.engineMeta[view.engine].layer} • {catalog.countries.find(c=>c.id===view.country)?.name}</span><h2>{catalog.engineMeta[view.engine].title}</h2><p>{catalog.engineMeta[view.engine].subtitle}. Select any indicator to open its full research page.</p></div><div className="searchBox"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search indicators..."/></div></section>
       <div className="engineGrid">{visibleSections.map(s=><EngineSection key={s.id} section={s} collapsed={!!collapsed[s.id]} toggle={()=>setCollapsed(x=>({...x,[s.id]:!x[s.id]}))} onOpen={openIndicator}/>)}</div>
       <section className="frameworkStrip"><div><span>MACRO FLOW</span><b>Economy → Policy → Market</b><p>Economic activity changes → inflation & employment → Fed interpretation → yields & USD → U.S. indices.</p></div><div className="flowMini"><span>CAUSE</span><ArrowRightSmall/><span>REACTION</span><ArrowRightSmall/><span>RESULT</span></div></section>
     </>}
   </main>
   {showSettings&&<div className="modalBackdrop" onClick={()=>setShowSettings(false)}><div className="settingsModal" onClick={e=>e.stopPropagation()}><div className="panelHeading"><div><span>UPDATE CENTER</span><b>Content updates without replacing the desktop app</b></div><button className="backButton" onClick={()=>setShowSettings(false)}>Close</button></div><p className="settingsHelp">Indicator lists, labels, descriptions and content come from a JSON content pack and are stored locally. Executable code is never stored in SQLite. Source-code changes are delivered automatically through the signed desktop updater.</p><label>Content Pack URL<input value={contentPackUrl} onChange={e=>setContentPackUrl(e.target.value)} placeholder="https://your-server.example/macro-engine/catalog.json"/></label><label>Application Update Repository<input value={appUpdateUrl} onChange={e=>setAppUpdateUrl(e.target.value)} placeholder="https://github.com/YOUR-USER/macro-engine-desktop"/></label><div className="settingsActions"><button onClick={saveSettings}>Save</button><button onClick={syncContent}>Sync Content</button><button onClick={checkAppUpdate}>Check App Update</button>{appUpdate?.state==='downloaded'&&<button onClick={installAppUpdate}>Restart & Install</button>}<button onClick={async()=>{await window.macroAPI.resetCatalog?.();const r=await window.macroAPI.getCatalog?.();if(r?.catalog)setCatalog({...r.catalog,source:r.source,updatedAt:r.updatedAt});setSyncMessage("Restored bundled catalog")}}>Restore Bundled</button></div><small className="syncMessage">{syncMessage}{appUpdate?.state?` • App updater: ${appUpdate.state}${appUpdate.progress!=null?` ${appUpdate.progress}%`:''}`:''}</small><div className="updateNote"><b>Permanent update architecture</b><span>Data → cache → SQLite • Content → SQLite • Source-code changes → signed GitHub release → automatic background download → restart & install.</span></div></div></div>}
 </div>
}

function EngineSection({section,collapsed,toggle,onOpen}:{section:Section;collapsed:boolean;toggle:()=>void;onOpen:(i:Indicator)=>void}){return <article className={`engineSection ${section.color}`}><button className="sectionTop" onClick={toggle}><span className="sectionNumber">{section.id}</span><span className="sectionIcon">{section.icon}</span><span className="sectionTitle"><b>{section.title}</b><small>{section.description}</small></span><span className="indicatorCount">{section.indicators.length} indicators</span>{collapsed?<ChevronRight size={17}/>:<ChevronDown size={17}/>}</button>{!collapsed&&<div className="indicatorList">{section.indicators.map(i=><button className={`indicatorRow ${i.id==='nonfarm-payrolls'?'featured':''}`} key={i.id} onClick={()=>onOpen(i)}><span className="indicatorDot"/><span className="indicatorName"><b>{i.name}</b><small>{i.description}</small></span><span className="indicatorRole">{i.id==='nonfarm-payrolls'?'LIVE + SNAPSHOT':'ADAPTER READY'}</span><ChevronRight size={14}/></button>)}</div>}</article>}

function IndicatorPage({indicator,engine,releases,loading,diagnostic,onBack,onRefresh}:{indicator:Indicator;engine:EngineId;releases:Release[];loading:boolean;diagnostic:any;onBack:()=>void;onRefresh:()=>void}){
 const isNfp=indicator.id==='nonfarm-payrolls';
 const latest=isNfp?releases.length?releases[releases.length-1]:undefined:undefined;
 const previous=isNfp?releases.length>1?releases[releases.length-2]:undefined:undefined;
 const bias=latest?.surprise==null?'NEUTRAL':latest.surprise>0?'BULLISH':'BEARISH';
 const observations=isNfp&&latest?makeNfpObservations(latest,previous):null;
 return <div className="detailPage">
   <div className="detailToolbar"><button className="backButton" onClick={onBack}><ArrowLeft size={15}/> Back to {bundledEngineMeta[engine].title}</button><div className="detailActions"><button onClick={onRefresh}><RefreshCw size={14}/> Refresh</button><button onClick={()=>window.macroAPI.openExternal(indicator.sourceUrl||ffPage)}><ExternalLink size={14}/> Source</button></div></div>
   <section className="detailHero"><div><span className="goldEyebrow">{isNfp?'FOREX FACTORY RELEASE-VINTAGE DATA':'MACRO INDICATOR RESEARCH PAGE'}</span><h2>{indicator.name}</h2><p>{indicator.description} The same detail template is available across every indicator in the Economy → Policy → Market framework.</p><div className="metaChips"><span>{indicator.frequency}</span><span>{indicator.unit}</span><span>{indicator.sourceName}</span></div></div><div className={`biasCard ${bias.toLowerCase()}`}><span>MARKET BIAS</span><b>{bias}</b><small>{isNfp?bias==='BULLISH'?'Actual beat consensus.':bias==='BEARISH'?'Actual missed consensus.':'No consensus surprise.':'Calculated when a live connector is available.'}</small></div></section>
   <div className="metricGrid">
    <Metric label="Actual" value={isNfp?latest?.actualText:'—'} icon={<Activity/>}/><Metric label="Forecast / Estimate" value={isNfp?latest?.forecastText:'—'} icon={<BarChart3/>}/><Metric label="Previous" value={isNfp?latest?.previousText:'—'} icon={<TrendingDown/>}/><Metric label="Surprise" value={isNfp?latest?.surpriseText:'—'} icon={<TrendingUp/>}/>
   </div>
   <div className="detailColumns">
     <div className="detailMain">
       <section className="researchPanel"><div className="panelHeading"><div><span>HISTORICAL TREND</span><b>Last 12 Months / Release History</b></div><small>{isNfp?`${releases.length} verified release records`:'Historical connector pending'}</small></div>{isNfp?<ReleaseChart releases={releases}/>:<EmptyConnector indicator={indicator}/>}</section>
       <section className="researchPanel"><div className="panelHeading"><div><span>HISTORICAL DATA</span><b>12-Month Release Table</b></div><small>{isNfp?'Actual vs Forecast vs Previous':''}</small></div>{isNfp?<ReleaseTable releases={releases}/>:<EmptyConnector indicator={indicator}/>}</section>
       {observations&&<section className="observationsPanel"><div className="panelHeading"><div><span>RECENT RELEASE OBSERVATIONS</span><b>What the latest NFP release tells us</b></div><span className="latestBadge">{latest?.date}</span></div><div className="observationGrid">{observations.map((x,i)=><div className="observation" key={i}><span>{x.label}</span><b>{x.value}</b><p>{x.text}</p></div>)}</div><div className="macroChain"><span>Jobs</span><ArrowRightSmall/><span>Fed expectations</span><ArrowRightSmall/><span>Yields</span><ArrowRightSmall/><span>USD</span><ArrowRightSmall/><span>NQ / SPX / Gold</span></div></section>}
     </div>
     <aside className="detailSide">
       <section className="sidePanel"><div className="sourceIcon"><Globe2 size={20}/></div><span className="goldEyebrow">DATA SOURCE</span><h3>{indicator.sourceName}</h3><p>{isNfp?'The normal calendar webpage is the reference. The weekly machine-readable JSON is used for live updates when available; the verified local snapshot preserves historical release-vintage values.':'This indicator is included in the final navigation and uses the same source/interpretation template. A dedicated historical adapter can be attached without changing the UI.'}</p><button onClick={()=>window.macroAPI.openExternal(ffPage)}><ExternalLink size={14}/> Open reference website</button>{isNfp&&<button onClick={()=>window.macroAPI.openExternal(ffJson)}><Database size={14}/> Open machine-readable feed</button>}<div className="sourceFacts"><span>Source</span><b>{indicator.sourceName}</b><span>Series</span><b>{indicator.seriesId||'Connector-specific'}</b><span>Transport</span><b>{isNfp?(diagnostic?.transport||'Local snapshot'): 'Adapter ready'}</b></div></section>
       <section className="sidePanel interpretation"><span className="goldEyebrow">INTERPRETATION</span><h3>{isNfp?'NFP analyst checklist':'Analyst checklist'}</h3><ul>{isNfp?<><li>Actual vs Forecast: the first surprise signal.</li><li>Previous revision: check whether the prior month changed.</li><li>Unemployment and wages: confirm the quality of the labour signal.</li><li>Trend: use several releases, not one number alone.</li><li>Policy path: jobs + inflation shape Fed expectations.</li></>:<><li>Compare Actual with Forecast/Consensus.</li><li>Compare with Previous and any revision.</li><li>Look for a 3–6 month trend.</li><li>Translate the signal into policy expectations.</li><li>Then assess yields, USD and risk assets.</li></>}</ul></section>
     </aside>
   </div>
 </div>
}

function Metric({label,value,icon}:{label:string;value?:string|null;icon:React.ReactNode}){return <div className="metric"><div className="metricIcon">{icon}</div><span>{label}</span><b>{value||'—'}</b></div>}
function EmptyConnector({indicator}:{indicator:Indicator}){return <div className="connectorEmpty"><Database size={28}/><b>{indicator.name}</b><span>Navigation and research template ready. Historical data adapter is not populated in this build, so no numbers are invented.</span></div>}
function ReleaseChart({releases}:{releases:Release[]}){if(!releases.length)return <div className="connectorEmpty">No observations.</div>;const vals=releases.map(r=>r.actual||0),min=Math.min(...vals),max=Math.max(...vals);const pts=releases.map((r,i)=>{const x=4+(i/Math.max(1,releases.length-1))*92;const y=88-((r.actual!-min)/(max-min||1))*66;return `${x},${y}`}).join(' ');return <div className="chartBox"><div className="chartLabels"><span>{max>0?`+${max}K`:max+'K'}</span><span>0</span><span>{min<0?min+'K':'+'+min+'K'}</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="4" x2="96" y1="55" y2="55"/><polyline points={pts} fill="none" vectorEffect="non-scaling-stroke"/></svg><div className="chartDates"><span>{releases[0].date}</span><span>{releases.length?releases[releases.length-1]:undefined?.date}</span></div></div>}
function ReleaseTable({releases}:{releases:Release[]}){return <div className="tableWrap"><table><thead><tr><th>Release</th><th>Actual</th><th>Forecast</th><th>Previous</th><th>Surprise</th></tr></thead><tbody>{releases.slice().reverse().map((r,i)=><tr key={`${r.date}-${r.releaseLabel}-${i}`}><td><b>{r.date}</b>{r.releaseLabel&&<small>{r.releaseLabel}</small>}</td><td>{r.actualText}</td><td>{r.forecastText}</td><td>{r.previousText}</td><td className={r.surprise&&r.surprise>0?'positive':r.surprise&&r.surprise<0?'negative':''}>{r.surpriseText}</td></tr>)}</tbody></table></div>}
function makeNfpObservations(latest:Release,prev?:Release){const surprise=latest.surprise||0;const dir=surprise>0?'beat':surprise<0?'missed':'matched';return [
 {label:'Latest release',value:latest.actualText||'—',text:`NFP printed ${latest.actualText||'—'} versus consensus ${latest.forecastText||'—'} — a ${dir} of ${Math.abs(surprise)}K.`},
 {label:'Previous',value:latest.previousText||'—',text:`The calendar’s previous figure was ${latest.previousText||'—'}; compare it with the prior release ${prev?.actualText||'—'} to judge the trend.`},
 {label:'Market read',value:surprise>0?'Risk-on / USD-positive bias':'Risk-off / USD-negative bias',text:surprise>0?'A positive payroll surprise can lift Fed-rate expectations, Treasury yields and the USD, while pressuring rate-sensitive equities.':'A negative payroll surprise can reduce Fed-rate expectations, yields and the USD, while supporting rate-sensitive equities.'},
 {label:'Analyst caution',value:'Check wages + unemployment',text:'NFP alone is not the whole labour story. Confirm wage growth, unemployment and revisions before forming a strong policy view.'}
]}
function ArrowRightSmall(){return <span className="flowArrow">→</span>}

createRoot(document.getElementById('root')!).render(<App/>);
