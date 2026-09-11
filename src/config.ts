export type EngineId = 'economy'|'policy'|'market';
export type Country={id:string;name:string;flag:string;accent:string;region:string};
export type Indicator={id:string;name:string;description:string;sourceId:string;sourceName:string;seriesId?:string;unit:string;frequency:string;role:string;sourceUrl?:string;live?:boolean;tags?:string[];polarity?:'higher'|'lower'|'neutral'};
export type Section={id:number;title:string;icon:string;engine:EngineId;color:string;description:string;indicators:Indicator[]};

export const countries:Country[]=[
 {id:'US',name:'United States',flag:'🇺🇸',accent:'#d9ad45',region:'North America'},
 {id:'CA',name:'Canada',flag:'🇨🇦',accent:'#d9ad45',region:'North America'},
 {id:'JP',name:'Japan',flag:'🇯🇵',accent:'#d9ad45',region:'Asia'},
 {id:'EA',name:'Euro Area',flag:'🇪🇺',accent:'#d9ad45',region:'Europe'},
 {id:'GB',name:'United Kingdom',flag:'🇬🇧',accent:'#d9ad45',region:'Europe'},
 {id:'CN',name:'China',flag:'🇨🇳',accent:'#d9ad45',region:'Asia'},
 {id:'IN',name:'India',flag:'🇮🇳',accent:'#d9ad45',region:'Asia'},
 {id:'AU',name:'Australia',flag:'🇦🇺',accent:'#d9ad45',region:'Oceania'}
];

const ff='forexfactory';
const ffs='Forex Factory — Calendar';
const ind=(id:string,name:string,group:string,desc:string='',polarity:'higher'|'lower'|'neutral'='neutral'):Indicator=>({id,name,description:desc||`${name} macroeconomic indicator in the ${group} framework.`,sourceId:ff,sourceName:ffs,unit:'Release value',frequency:'Release-based',role:group,sourceUrl:'https://www.forexfactory.com/calendar',tags:[group],polarity});

const economyGroups:Section[]=[
 {id:1,title:'Credit & Financial Conditions',engine:'economy',icon:'🏦',color:'green',description:'Credit availability shapes household and business spending capacity.',indicators:[
  ind('loan-officer-survey','Loan Officer Survey','Credit & Financial Conditions','Bank lending standards and loan demand.', 'lower'),
  ind('consumer-credit','Consumer Credit m/m','Credit & Financial Conditions','Change in consumer credit.', 'higher'),
  ind('mortgage-delinquencies','Mortgage Delinquencies','Credit & Financial Conditions','Share of mortgage balances becoming delinquent.','lower')
 ]},
 {id:2,title:'Household Income & Purchasing Power',engine:'economy',icon:'💰',color:'cyan',description:'Income and wages determine household purchasing power.',indicators:[
  ind('average-hourly-earnings','Average Hourly Earnings m/m','Household Income','Monthly wage growth.','higher'),
  ind('personal-income','Personal Income m/m','Household Income','Personal income growth.','higher')
 ]},
 {id:3,title:'Consumer Spending & Demand',engine:'economy',icon:'🛒',color:'red',description:'Consumer demand is a major engine of U.S. growth.',indicators:[
  ind('retail-sales','Retail Sales m/m','Consumer Demand','Headline retail sales growth.','higher'),
  ind('core-retail-sales','Core Retail Sales m/m','Consumer Demand','Retail sales excluding volatile components.','higher'),
  ind('personal-spending','Personal Spending m/m','Consumer Demand','Household spending growth.','higher'),
  ind('vehicle-sales','Omdia Total Vehicle Sales','Consumer Demand','Vehicle sales pace.','higher')
 ]},
 {id:4,title:'Consumer & Business Sentiment',engine:'economy',icon:'👥',color:'gold',description:'Confidence provides a window into future spending and hiring.',indicators:[
  ind('cb-consumer-confidence','CB Consumer Confidence','Sentiment','Conference Board consumer confidence.','higher'),
  ind('prelim-uom-sentiment','Prelim UoM Consumer Sentiment','Sentiment','Preliminary University of Michigan sentiment.','higher'),
  ind('revised-uom-sentiment','Revised UoM Consumer Sentiment','Sentiment','Revised University of Michigan sentiment.','higher'),
  ind('prelim-uom-inflation-expectations','Prelim UoM Inflation Expectations','Sentiment','Preliminary inflation expectations.','lower'),
  ind('revised-uom-inflation-expectations','Revised UoM Inflation Expectations','Sentiment','Revised inflation expectations.','lower'),
  ind('tipp-economic-optimism','RCM/TIPP Economic Optimism','Sentiment','Household economic optimism.','higher'),
  ind('nfib-small-business','NFIB Small Business Index','Sentiment','Small business optimism and conditions.','higher')
 ]},
 {id:5,title:'Housing & Real Estate',engine:'economy',icon:'🏠',color:'green',description:'Housing connects construction, employment, wealth and demand.',indicators:[
  ind('nahb-housing-market','NAHB Housing Market Index','Housing','Homebuilder sentiment.','higher'),
  ind('building-permits','Building Permits','Housing','Permits for future construction.','higher'),
  ind('housing-starts','Housing Starts','Housing','New residential construction starts.','higher'),
  ind('existing-home-sales','Existing Home Sales','Housing','Existing home transaction volume.','higher'),
  ind('new-home-sales','New Home Sales','Housing','New home sales pace.','higher'),
  ind('pending-home-sales','Pending Home Sales m/m','Housing','Contracted home sales activity.','higher'),
  ind('construction-spending','Construction Spending m/m','Housing','Construction expenditure growth.','higher'),
  ind('hpi','HPI m/m','Housing','House price index monthly change.','higher'),
  ind('sp20-hpi','S&P/CS Composite-20 HPI y/y','Housing','20-city home price growth.','higher')
 ]},
 {id:6,title:'Business Demand & Trade',engine:'economy',icon:'🏭',color:'blue',description:'Orders and trade show demand flowing into production.',indicators:[
  ind('factory-orders','Factory Orders m/m','Business Demand','Manufacturing orders.','higher'),
  ind('durable-goods','Durable Goods Orders m/m','Business Demand','Orders for long-lived manufactured goods.','higher'),
  ind('core-durable-goods','Core Durable Goods Orders m/m','Business Demand','Core capital-goods demand.','higher'),
  ind('trade-balance','Trade Balance','Business Demand','Exports minus imports.','higher'),
  ind('goods-trade-balance','Goods Trade Balance','Business Demand','Goods-only trade balance.','higher')
 ]},
 {id:7,title:'Business Surveys (Leading)',engine:'economy',icon:'📊',color:'blue',description:'Survey data can turn before hard economic activity.',indicators:[
  ind('empire-state','Empire State Manufacturing Index','Business Surveys','New York manufacturing conditions.','higher'),
  ind('philly-fed','Philly Fed Manufacturing Index','Business Surveys','Philadelphia manufacturing conditions.','higher'),
  ind('richmond-fed','Richmond Manufacturing Index','Business Surveys','Richmond Fed manufacturing conditions.','higher'),
  ind('chicago-pmi','Chicago PMI','Business Surveys','Chicago-area business conditions.','higher'),
  ind('final-manufacturing-pmi','Final Manufacturing PMI','Business Surveys','Final manufacturing PMI.','higher'),
  ind('ism-manufacturing','ISM Manufacturing PMI','Business Surveys','ISM manufacturing activity.','higher'),
  ind('flash-manufacturing-pmi','Flash Manufacturing PMI','Business Surveys','Early manufacturing PMI.','higher'),
  ind('ism-services','ISM Services PMI','Business Surveys','ISM services activity.','higher'),
  ind('final-services-pmi','Final Services PMI','Business Surveys','Final services PMI.','higher'),
  ind('flash-services-pmi','Flash Services PMI','Business Surveys','Early services PMI.','higher'),
  ind('cb-leading-index','CB Leading Index m/m','Business Surveys','Conference Board leading index.','higher')
 ]},
 {id:8,title:'Production & Capacity',engine:'economy',icon:'⚙️',color:'cyan',description:'Factory output and capacity utilization show real production pressure.',indicators:[
  ind('industrial-production','Industrial Production m/m','Production','Industrial output growth.','higher'),
  ind('capacity-utilization','Capacity Utilization Rate','Production','Share of productive capacity in use.','higher'),
  ind('construction-spending-2','Construction Spending m/m','Production','Construction activity spending.','higher')
 ]},
 {id:9,title:'Inventories & Energy',engine:'economy',icon:'🛢️',color:'green',description:'Inventories and energy balances affect production and prices.',indicators:[
  ind('wholesale-inventories','Final Wholesale Inventories m/m','Inventories & Energy','Wholesale inventory growth.','neutral'),
  ind('business-inventories','Business Inventories m/m','Inventories & Energy','Business inventory growth.','neutral'),
  ind('api-statistical-bulletin','API Weekly Statistical Bulletin','Inventories & Energy','API weekly petroleum statistics.','neutral'),
  ind('api-inventories','API Weekly Inventories Bulletin','Inventories & Energy','API weekly inventory changes.','neutral'),
  ind('crude-oil-inventories','Crude Oil Inventories','Inventories & Energy','U.S. crude inventory change.','neutral'),
  ind('natural-gas-storage','Natural Gas Storage','Inventories & Energy','U.S. natural gas storage change.','neutral')
 ]},
 {id:10,title:'Labour Demand',engine:'economy',icon:'👤',color:'cyan',description:'Openings, hiring and layoffs reveal labour demand before payroll outcomes.',indicators:[
  ind('jolts-job-openings','JOLTS Job Openings','Labour Demand','Job openings and labour demand.','higher'),
  ind('adp-nonfarm','ADP Non-Farm Employment Change','Labour Demand','Private payroll estimate.','higher'),
  ind('adp-weekly','ADP Weekly Employment Change','Labour Demand','Weekly employment signal.','higher'),
  ind('challenger-job-cuts','Challenger Job Cuts y/y','Labour Demand','Announced job cuts.','lower')
 ]},
 {id:11,title:'Employment Outcome',engine:'economy',icon:'👨‍👩‍👧',color:'green',description:'Employment outcomes are the headline labour-market result.',indicators:[
  {...ind('nonfarm-payrolls','Nonfarm Payrolls (NFP)','Employment Outcome','Forex Factory release-vintage values: Actual, Forecast, Previous and Surprise.','higher'),seriesId:'FOREXFACTORY-NFP',unit:'Thousands',frequency:'Monthly',role:'Employment Outcome',sourceUrl:'https://www.forexfactory.com/calendar',live:true,tags:['NFP','live']},
  ind('unemployment-rate','Unemployment Rate','Employment Outcome','Headline unemployment rate.','lower'),
  ind('unemployment-claims','Unemployment Claims','Employment Outcome','Initial unemployment claims.','lower')
 ]},
 {id:12,title:'Wages, Productivity & Costs',engine:'economy',icon:'💵',color:'cyan',description:'Wages and productivity feed into labour costs and inflation.',indicators:[
  ind('hourly-earnings','Average Hourly Earnings m/m','Wages & Costs','Monthly wage growth.','higher'),
  ind('nonfarm-productivity','Prelim Nonfarm Productivity q/q','Wages & Costs','Output per worker growth.','higher'),
  ind('unit-labor-costs','Prelim Unit Labor Costs q/q','Wages & Costs','Labour cost per unit of output.','lower')
 ]},
 {id:13,title:'Input Prices (Producer)',engine:'economy',icon:'📄',color:'blue',description:'Producer/input prices can pass through to consumers.',indicators:[
  ind('import-prices','Import Prices m/m','Producer Prices','Import price growth.','lower'),
  ind('ppi','PPI m/m','Producer Prices','Producer price inflation.','lower'),
  ind('core-ppi','Core PPI m/m','Producer Prices','Core producer inflation.','lower')
 ]},
 {id:14,title:'Consumer Inflation',engine:'economy',icon:'%',color:'red',description:'Consumer inflation is central to monetary policy.',indicators:[
  ind('cpi-mm','CPI m/m','Consumer Inflation','Monthly headline CPI.','lower'),
  ind('cpi-yy','CPI y/y','Consumer Inflation','Yearly headline CPI.','lower'),
  ind('core-cpi-mm','Core CPI m/m','Consumer Inflation','Monthly core CPI excluding food and energy.','lower'),
  ind('core-cpi-yy','Core CPI y/y','Consumer Inflation','Yearly core CPI.','lower')
 ]},
 {id:15,title:'Inflation Expectations',engine:'economy',icon:'📈',color:'blue',description:'Expected inflation influences wages, prices and policy expectations.',indicators:[
  ind('cleveland-inflation-expectations','Cleveland Fed Inflation Expectations','Inflation Expectations','Cleveland Fed inflation expectations.','lower'),
  ind('prelim-uom-inflation','Prelim UoM Inflation Expectations','Inflation Expectations','Preliminary UoM inflation expectations.','lower'),
  ind('revised-uom-inflation','Revised UoM Inflation Expectations','Inflation Expectations','Revised UoM inflation expectations.','lower')
 ]},
 {id:16,title:"Fed's Key Inflation Gauge",engine:'economy',icon:'🎯',color:'blue',description:'Core PCE is the Fed’s preferred inflation measure.',indicators:[
  ind('core-pce','Core PCE Price Index m/m',"Fed's Key Inflation Gauge",'Core PCE monthly inflation.','lower')
 ]}
];

const policyGroups:Section[]=[
 {id:17,title:'Fiscal / Government',engine:'policy',icon:'🏛️',color:'red',description:'Fiscal policy affects demand, deficits and Treasury supply.',indicators:[ind('federal-budget-balance','Federal Budget Balance','Fiscal / Government','Federal government surplus or deficit.','higher')]},
 {id:18,title:'International Flows',engine:'policy',icon:'🌐',color:'red',description:'Cross-border capital flows affect yields and financial conditions.',indicators:[ind('tic-long-term-purchases','TIC Long-Term Purchases','International Flows','Foreign purchases of long-term U.S. securities.','higher')]},
 {id:19,title:'Treasury Auctions',engine:'policy',icon:'🔨',color:'red',description:'Treasury auctions reveal demand for government debt.',indicators:[ind('10y-auction','10-y Bond Auction','Treasury Auctions','Demand and pricing at the 10-year Treasury auction.','higher'),ind('30y-auction','30-y Bond Auction','Treasury Auctions','Demand and pricing at the 30-year Treasury auction.','higher')]},
 {id:20,title:'Policy Communication (Fed & Others)',engine:'policy',icon:'👥',color:'red',description:'Speeches and minutes change the expected policy path.',indicators:[
  ind('fomc-minutes','FOMC Meeting Minutes','Policy Communication','Detailed record of the FOMC meeting.'),
  ind('schmid-speaks','FOMC Member Schmid Speaks','Policy Communication','Fed communication event.'),
  ind('daly-speaks','FOMC Member Daly Speaks','Policy Communication','Fed communication event.'),
  ind('musalem-speaks','FOMC Member Musalem Speaks','Policy Communication','Fed communication event.'),
  ind('bostic-speaks','FOMC Member Bostic Speaks','Policy Communication','Fed communication event.'),
  ind('bowman-speaks','FOMC Member Bowman Speaks','Policy Communication','Fed communication event.'),
  ind('hammack-speaks','FOMC Member Hammack Speaks','Policy Communication','Fed communication event.'),
  ind('goolsbee-speaks','FOMC Member Goolsbee Speaks','Policy Communication','Fed communication event.'),
  ind('waller-speaks','Fed Chairman Waller Speaks','Policy Communication','Fed communication event.'),
  ind('bessent-speaks','Treasury Sec Bessent Speaks','Policy Communication','Treasury policy communication event.'),
  ind('trump-speaks','President Trump Speaks','Policy Communication','Executive-branch policy communication event.')
 ]},
 {id:21,title:'Major Policy Events',engine:'policy',icon:'🗓️',color:'red',description:'Major policy gatherings can reshape the forward path.',indicators:[ind('jackson-hole','Jackson Hole Symposium','Major Policy Events','Major central-bank policy gathering.'),ind('g20-meetings','G20 Meetings','Major Policy Events','Major global policy meetings.')]}
];

const marketGroups:Section[]=[
 {id:22,title:'Rate Expectations',engine:'market',icon:'%',color:'blue',description:'Market pricing of future Fed moves.',indicators:[ind('rate-expectations','Rate Expectations','Rate Expectations','Market-implied probability of future cuts, holds or hikes.')]},
 {id:23,title:'Treasury Yields',engine:'market',icon:'📈',color:'blue',description:'2Y and 10Y yields transmit policy expectations.',indicators:[ind('treasury-yields','Treasury Yields','Treasury Yields','Key Treasury yields and curve dynamics.')]},
 {id:24,title:'USD (Dollar)',engine:'market',icon:'💲',color:'blue',description:'Dollar strength reflects yields, capital flows and policy expectations.',indicators:[ind('usd-dollar','USD (Dollar)','USD','U.S. dollar strength and macro sensitivity.')]},
 {id:25,title:'US Indices (NQ / ES / YM)',engine:'market',icon:'📊',color:'blue',description:'Equity index response to rates, USD and risk sentiment.',indicators:[ind('us-indices','US Indices (NQ / ES / YM)','US Indices','Futures/equity index market reaction.')]}
];

export const sections:Section[]=[...economyGroups,...policyGroups,...marketGroups];
export const sourceRegistry=[{id:ff,name:ffs,url:'https://www.forexfactory.com/calendar',type:'calendar'}];
export const engineMeta:Record<EngineId,{layer:string;title:string;subtitle:string;icon:string}>={
 economy:{layer:'LAYER 1',title:'Economy Engine',subtitle:'Real economic activity — CAUSE',icon:'🏭'},
 policy:{layer:'LAYER 2',title:'Policy Engine',subtitle:'Fed interpretation & action — REACTION',icon:'🏛️'},
 market:{layer:'LAYER 3',title:'Market Engine',subtitle:'Financial market reaction — RESULT',icon:'📈'}
};
