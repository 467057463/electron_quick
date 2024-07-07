import { BrowserWindow } from 'electron/main';
import path from 'node:path'
const createWin = (winName) => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [`currentwinName=${winName}`]
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
  return win;
}

export default createWin;