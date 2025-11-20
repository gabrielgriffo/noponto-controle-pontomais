const { app, BrowserWindow } = require('electron/main')
const { createMainWindow } = require('./windows/mainWindow')
const registerIpcHandlers = require('./ipc')

app.setName("No Ponto")
app.setAppUserModelId("com.gabrielgriffo.noponto")

function bootstrap() {
  // Registrar handlers de IPC
  registerIpcHandlers()

  // Criar janela principal
  createMainWindow()

  // No macOS, recriar a janela quando o ícone do dock for clicado
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
}

app.whenReady().then((bootstrap))

// Fechar a aplicação quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})