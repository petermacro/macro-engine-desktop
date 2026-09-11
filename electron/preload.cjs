const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('macroAPI', {
  getSeries: (request) => ipcRenderer.invoke('series:get', request),
  testBls: () => ipcRenderer.invoke('bls:test'),
  testForexFactory: () => ipcRenderer.invoke('ff:test'),
  saveSeries: (payload) => ipcRenderer.invoke('series:save', payload),
  listSaved: (indicatorId, country) => ipcRenderer.invoke('series:list', { indicatorId, country }),
  forecast: (payload) => ipcRenderer.invoke('forecast:run', payload),
  exportWorkbook: (payload) => ipcRenderer.invoke('export:xlsx', payload),
  exportPdf: (payload) => ipcRenderer.invoke('export:pdf', payload),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  refreshAll: () => ipcRenderer.invoke('data:refresh-all'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  getSourceOverrides: () => ipcRenderer.invoke('source:get-overrides'),
  saveSourceOverride: (payload) => ipcRenderer.invoke('source:save-override', payload),
  resetSourceOverride: (indicatorId) => ipcRenderer.invoke('source:reset-override', {indicatorId}),
  applySourceToAll: (payload) => ipcRenderer.invoke('source:apply-all', payload),
  createDesktopShortcut: () => ipcRenderer.invoke('shortcut:create'),
  getCatalog: () => ipcRenderer.invoke('catalog:get'),
  syncCatalog: () => ipcRenderer.invoke('catalog:sync'),
  resetCatalog: () => ipcRenderer.invoke('catalog:reset'),
  checkAppUpdate: () => ipcRenderer.invoke('app-update:check'),
  installAppUpdate: () => ipcRenderer.invoke('app-update:install'),
  getAppUpdateVersion: () => ipcRenderer.invoke('app-update:version'),
  onAppUpdateStatus: (callback) => { ipcRenderer.on('app-update:status', (_event, data) => callback(data)); return () => ipcRenderer.removeAllListeners('app-update:status'); }
});
