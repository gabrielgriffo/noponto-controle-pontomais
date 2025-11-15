const { BrowserWindow } = require('electron')
const path = require('node:path')

/**
 * Cria e configura a janela principal da aplicação
 * @returns {BrowserWindow} A janela principal criada
 */
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
  })

  // Carrega o HTML principal
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'))

  // Mostra a janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  return mainWindow
}

module.exports = { createMainWindow }
