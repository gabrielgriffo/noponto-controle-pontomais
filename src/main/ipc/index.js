const registerPing = require('./ping.js')
const registerDialog = require('./dialog.js')

module.exports = function registerIpcHandlers() {
    registerPing()
    registerDialog()
}