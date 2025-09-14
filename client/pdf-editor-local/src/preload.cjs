const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  loadIssueData: (folderPath) => ipcRenderer.invoke('load-issue-data', folderPath),
  startWatching: (folderPath) => ipcRenderer.invoke('start-watching', folderPath),
  stopWatching: () => ipcRenderer.invoke('stop-watching'),
  onFileChanged: (callback) => {
    ipcRenderer.on('file-changed', (event, filePath) => callback(filePath))
  },
  onFileAdded: (callback) => {
    ipcRenderer.on('file-added', (event, filePath) => callback(filePath))
  },
  onFileRemoved: (callback) => {
    ipcRenderer.on('file-removed', (event, filePath) => callback(filePath))
  }
})