const { ipcMain, Notification } = require('electron/main')

module.exports = function registerDialog(){
  
  const notification = new Notification({
    'title': 'Teste 123',
    'subtitle': 'subtitle Teste 123',
    'body': 'Body',
    'timeoutType': 'default',
    'icon': 'icon'
  })
  
  notification.show()

  ipcMain.handle('ping', () => 'pong')
}