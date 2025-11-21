const fs = require('fs')
const path = require('path')
const os = require('os')
const { screen } = require('electron')

// Arquivo onde o estado da janela é salvo (posição e tamanho)
const stateFile = path.join(os.homedir(), '.noponto-window-state.json')

// Carrega o estado salvo da janela ou retorna valores padrão
function loadState(defaults) {
  let state
  try {
    // Tenta ler o arquivo de estado
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  } catch {
    // Se falhar (arquivo não existe ou JSON inválido), usa valores padrão
    return defaults
  }

  // Se a janela estiver fora de qualquer monitor, usar valores padrão
  if (!isInsideAnyDisplay(state)) {
    return defaults
  }

  return state
}

// Verifica se a posição da janela está dentro de algum monitor conectado
function isInsideAnyDisplay(state) {
  const displays = screen.getAllDisplays()
  // Retorna true se a janela estiver dentro de pelo menos um monitor
  return displays.some((d) => {
    const b = d.bounds
    return state.x >= b.x && state.y >= b.y && state.x < b.x + b.width && state.y < b.y + b.height
  })
}

// Salva o estado atual da janela (posição e tamanho) em arquivo
function saveState(win) {
  if (!win) return
  // Pega as coordenadas e dimensões atuais da janela
  const state = win.getBounds()
  // Salva em formato JSON
  fs.writeFileSync(stateFile, JSON.stringify(state))
}

module.exports = { loadState, saveState }
