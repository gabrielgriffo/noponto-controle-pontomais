const { BrowserWindow } = require('electron')
const { loadState, saveState } = require('../utils/windowState')
const path = require('node:path')

/**
 * Cria e configura a janela principal da aplicação
 * @returns {BrowserWindow} A janela principal criada
 */
function createMainWindow() {
  // Tamanho padrão caso não exista estado salvo
  const defaultState = { width: 900, height: 600 }

  // Carrega posição/tamanho salvos da última sessão
  const state = loadState(defaultState)

  const mainWindow = new BrowserWindow({
    ...state, // Aplica posição e tamanho salvos
    minWidth: 600,
    minHeight: 400,
    show: false, // Começa invisível para evitar flash branco
    // titleBarStyle: 'hiddenInset',
    // frame: false,
    maximizable: false,
    title: 'No Ponto',
    fullscreenable: false,
    // opacity: 0.97,
    backgroundColor: '#ffffff',
    webPreferences: {
      // Script que roda antes da página carregar (ponte entre main e renderer)
      preload: path.join(__dirname, '..', '..', 'preload', 'index.js'),
      // Isola contexto do preload do contexto da página (segurança)
      contextIsolation: true,
      // Impede uso de require() no renderer (segurança)
      nodeIntegration: false,
      devTools: true,
      // Impede carregar recursos de origens diferentes (segurança)
      webSecurity: true,
    },
  })

  // Carrega o HTML principal
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'))

  // Mostra a janela somente quando o conteúdo estiver pronto
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Flag para controlar se deve realmente fechar ou apenas esconder
  let isQuitting = false

  // Salva posição/tamanho antes de fechar
  mainWindow.on('close', (event) => {
    saveState(mainWindow)

    // Se não estiver realmente saindo, apenas esconde a janela
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // Método para permitir o fechamento real da janela
  mainWindow.allowClose = () => {
    isQuitting = true
  }

  return mainWindow
}

module.exports = { createMainWindow }
