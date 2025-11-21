const registerPing = require('./ping.js')
const registerDialog = require('./dialog.js')
const registerTray = require('./tray.js')

module.exports = function registerIpcHandlers(mainWindow) {
  registerPing()
  registerDialog()
  registerTray(mainWindow)
}
