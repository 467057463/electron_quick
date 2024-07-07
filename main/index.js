import { app, BrowserWindow, ipcMain } from 'electron/main'
import mainWindow from './browsers/main.js'
import secondWindow from './browsers/second.js'
import events, { createWindow } from '../plugins/events.js';


app.whenReady().then(() => {
  createWindow(mainWindow, 'mainWindow')
  setTimeout(() => {
    createWindow(secondWindow, 'secondWindow')
  }, 1000)
  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0){
      createWindow(mainWindow, 'mainWindow')
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin'){
    app.quit()
  }
})

ipcMain.on('test', (e, args) => {
  console.log(e, args)
  e.returnValue = 'sssssbbbbb'
})



events.on('test', (val) => {
  console.log('main resolve all:test event')
  console.log(val)
})

events.on('$:test', (val) => {
  console.log('main resolve mainWindows:test event')
  console.log(val)
})
