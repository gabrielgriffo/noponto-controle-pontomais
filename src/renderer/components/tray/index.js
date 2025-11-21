// Comunicação com o processo principal
const { ipcRenderer } = require('electron')

// Função para obter a altura real do container do menu
function getMenuDimensions() {
  const menuContainer = document.querySelector('.context-menu')

  // Pega a largura e altura real do conteúdo
  const contentWidth = menuContainer.offsetWidth
  const contentHeight = menuContainer.offsetHeight

  // Envia a altura e largura para o processo principal
  ipcRenderer.send('set-window-size', contentWidth, contentHeight)
}

// Envia a altura assim que a página for carregada
window.addEventListener('DOMContentLoaded', getMenuDimensions)

document.getElementById('btn-show').addEventListener('click', () => {
  ipcRenderer.send('show-window')
})

document.getElementById('btn-quit').addEventListener('click', () => {
  ipcRenderer.send('quit-app')
})
