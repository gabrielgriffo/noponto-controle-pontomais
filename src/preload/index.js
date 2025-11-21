const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  openDialog: (msg) => ipcRenderer.invoke('openDialog', msg),
  // we can also expose variables, not just functions
})

// contextBridge.exposeInMainWorld('electron', {
//   showMenu: (x, y) => ipcRenderer.invoke('show-custom-menu', x, y),
//   onMenuAction: (callback) => ipcRenderer.on('menu-action', (_, data) => callback(data)),
//   menuItemClick: (action) => ipcRenderer.invoke('menu-item-click', action),
// })
