const { ipcMain, dialog, Menu, Tray } = require('electron/main')

module.exports = function registerDialog() {
  ipcMain.handle('openDialog', (event, msg) => {
    return dialog.showMessageBox({
      type: 'warning',
      message: msg,
    })
  })
}
