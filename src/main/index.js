const { app, BrowserWindow, ipcMain } = require('electron/main')
const { createMainWindow } = require('./windows/mainWindow')

app.whenReady().then(() => {
  // Registrar handlers de IPC
  ipcMain.handle('ping', () => 'pong')

  // Criar janela principal
  createMainWindow()

  // No macOS, recriar a janela quando o ícone do dock for clicado
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// Fechar a aplicação quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})