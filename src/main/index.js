const { app, BrowserWindow } = require('electron/main')
const { createMainWindow } = require('./windows/mainWindow')
const registerIpcHandlers = require('./ipc')

app.setName('No Ponto')
app.setAppUserModelId('com.gabrielgriffo.noponto')

// Garantir que apenas uma instância do aplicativo seja executada
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // Outra instância já está rodando, encerrar esta
  app.quit()
} else {
  // Esta é a primeira instância
  app.on('second-instance', () => {
    // Quando alguém tentar abrir uma segunda instância, mostrar e focar na janela existente
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show()
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  function bootstrap() {
    // Criar janela principal
    const mainWindow = createMainWindow()

    // Registrar handlers de IPC
    registerIpcHandlers(mainWindow)

    // No macOS, recriar a janela quando o ícone do dock for clicado
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      }
    })
  }

  app.whenReady().then(bootstrap)
}

app.on('window-all-closed', () => {
  // This will prevent the app from closing when windows close
})
