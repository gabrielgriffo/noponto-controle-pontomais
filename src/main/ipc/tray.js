const { app, BrowserWindow, Tray, ipcMain, screen, Menu } = require('electron/main')
const path = require('path')

module.exports = function registerTray(mainWindow) {
  const iconPath = path.join(__dirname, '../../renderer/assets/icons/icon.ico')
  tray = new Tray(iconPath)
  tray.setToolTip('No Ponto')

  if (process.platform === 'win32' || process.platform === 'darwin') {
    tray.on('double-click', () => {
      if (mainWindow) {
        if (!mainWindow.isVisible()) mainWindow.show()
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })

    tray.on('right-click', () => {
      const mousePosition = screen.getCursorScreenPoint()
      createMenuWindow(mousePosition)
    })
  } else {
    tray.on('click', () => {
      const mousePosition = screen.getCursorScreenPoint()
      createMenuWindow(mousePosition)
    })
  }

  ipcMain.on('show-window', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }

    if (menuWindow) {
      menuWindow.hide()
    }
  })

  ipcMain.on('quit-app', () => {
    // Permite que a janela feche de verdade
    if (mainWindow && mainWindow.allowClose) {
      mainWindow.allowClose()
    }
    app.quit()
  })
}

function createMenuWindow(mousePosition) {
  menuWindow = new BrowserWindow({
    width: 200,
    height: 68,
    show: false,
    frame: false,
    resizable: false,
    fullscreenable: false,
    transparent: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  menuWindow.loadFile(path.join(__dirname, '../../renderer/components/tray/index.html'))

  menuWindow.on('blur', () => {
    menuWindow.hide()
  })

  toggleMenu(mousePosition)
}

function toggleMenu(mousePosition) {
  const position = getWindowPosition(mousePosition)
  menuWindow.setPosition(position.x, position.y, false)
  menuWindow.show()
  menuWindow.focus()
}

function getWindowPosition(mousePosition) {
  const windowBounds = menuWindow.getBounds()

  // Pega as coordenadas do ícone da bandeja
  const x = Math.round(mousePosition.x - windowBounds.width / 2)
  const y = Math.round(mousePosition.y - windowBounds.height)

  return { x, y }
}

ipcMain.on('set-window-size', (event, width, height) => {
  // Certifique-se de que a janela só redimensione se for o menu
  if (menuWindow) {
    console.log('width, height: ', width, height)

    // Redimensiona a janela. O 'false' no final previne animação.
    // menuWindow.setSize(width, height, false);
  }
})
