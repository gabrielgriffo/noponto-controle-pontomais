const { BrowserWindow } = require('electron')
const { loadState, saveState } = require('../utils/windowState')
const path = require('node:path')

/**
 * Cria e configura a janela principal da aplicação
 * @returns {BrowserWindow} A janela principal criada
 */
function createMainWindow() {
  const defaultState = { width: 900, height: 600 }
  const state = loadState(defaultState)

  const mainWindow = new BrowserWindow({
    ...state,
    minWidth: 600,
    minHeight: 400,
    show: false,
    // titleBarStyle: 'hiddenInset',
    // frame: false,
    maximizable: false,
    title: 'No Ponto',
    fullscreenable: false,
    // opacity: 0.97,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, '..', '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true,
      webSecurity: true,
    },
  })

  // Carrega o HTML principal
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'))

  // Mostra a janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', () => saveState(mainWindow))

  return mainWindow
}

module.exports = { createMainWindow }
