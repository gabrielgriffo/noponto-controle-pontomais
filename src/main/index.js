const { app, BrowserWindow } = require('electron/main')
const { createMainWindow } = require('./windows/mainWindow')
const registerIpcHandlers = require('./ipc')

app.setName('No Ponto')
app.setAppUserModelId('com.gabrielgriffo.noponto')

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

app.on('window-all-closed', () => {
  // This will prevent the app from closing when windows close
})
