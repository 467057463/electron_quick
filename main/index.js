import { app, BrowserWindow, ipcMain } from 'electron/main';
import path  from 'node:path';

import events from '../plugins/events.js';
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0){
      createWindow()
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
  console.log(val)
})

