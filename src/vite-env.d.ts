/// <reference types="vite/client" />

declare global {
  interface Window {
    macroAPI: {
      testBls: () => Promise<any>;
      testForexFactory: () => Promise<any>;
      getSeries: (request: { indicatorId: string; indicatorName?: string; country?: string; sourceId?: string; sourceName?: string; sourceUrl?: string; referenceUrl?: string; seriesId?: string; polarity?: 'higher'|'lower'|'neutral'; frequency?: string; forecastUrl?: string }) => Promise<any>;
      saveSeries: (payload: any) => Promise<any>;
      listSaved: (indicatorId: string, country: string) => Promise<any[]>;
      forecast: (payload: any) => Promise<any>;
      exportWorkbook: (payload: any) => Promise<any>;
      exportPdf: (payload: any) => Promise<any>;
      openExternal: (url: string) => Promise<void>;
      refreshAll: () => Promise<any>;
      getSettings: () => Promise<{refreshMinutes?:number;teApiKey?:string;contentPackUrl?:string;appUpdateUrl?:string}>;
      saveSettings: (settings: any) => Promise<any>;
      getSourceOverrides: () => Promise<any[]>;
      saveSourceOverride: (payload: { indicatorId:string; sourceId:string; sourceName:string; sourceUrl?:string; seriesId?:string; referenceUrl?:string; historyUrl?:string; forecastUrl?:string }) => Promise<any>;
      resetSourceOverride: (indicatorId: string) => Promise<any>;
      applySourceToAll: (payload: any) => Promise<any>;
      createDesktopShortcut: () => Promise<any>;
      getCatalog: () => Promise<any>;
      syncCatalog: () => Promise<any>;
      resetCatalog: () => Promise<any>;
      checkAppUpdate: () => Promise<any>;
      installAppUpdate: () => Promise<any>;
      getAppUpdateVersion: () => Promise<any>;
      onAppUpdateStatus: (callback: (data:any) => void) => () => void;
    };
  }
}
export {};
