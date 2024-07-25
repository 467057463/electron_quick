import { app, BrowserWindow, ipcMain, Menu } from 'electron/main'
import mainWindow from './browsers/main.js'
import secondWindow from './browsers/second.js'
import events, { createWindow } from '../plugins/events.js';
// import events, { createWindow } from '../plugins/events/dist/main.js'

const contextMenu = Menu.buildFromTemplate([
  {
    label: '主进程',
    submenu: [
      { 
        label: '#:test',
        click: () => {
          console.log('#:test')
          events.emit('#:test', 'test main')
        }
      },
      {
        label: 'main:test',
        click: () => {
          console.log('main:test')
          events.emit('main:test', 'test main')
        }
      },
      {
        label: ':test',
        click: () => {
          console.log(':test')
          events.emit(':test', 'test main')
        }
      },
      {
        label: 'current:test',
        click: () => {
          console.log('current:test')
          events.emit('current:test', 'test main')
        }
      }
    ]
  },
  {
    label: '主窗口',
    submenu: [
      { 
        label: '$:test',
        click: () => {
          console.log('$:test')
          events.emit('$:test', 'test main')
        }
      },
      {
        label: 'mainWindow:test',
        click: () => {
          console.log('mainWindow:test')
          events.emit('mainWindow:test', 'test mainWindow')
        } 
      }
    ]
  },
  {
    label: '子窗口',
    submenu: [
      { 
        label: 'secondWindow:test',
        click: () => {
          console.log('secondWindow:test')
          events.emit('secondWindow:test', 'test secondWindow')
        } 
      },
    ]
  },
  {
    label: 'all',
    submenu: [
      { 
        label: 'test',
        click: () => {
          console.log('test')
          events.emit('test', 'test secondWindow all')
        } 
      },
    ]
  }
])

Menu.setApplicationMenu(contextMenu)

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
  e.returnValue = 'sssssbbbbb ssss'
})




// 监听主窗口
events.on('$:test', (val) => {
  console.log('main resolve $:test event')
  console.log(val)
})
events.on('mainWindow:test', (val) => {
  console.log('main resolve mainWindow:test event')
  console.log(val)
})

// 测试 all
events.on('test', (val) => {
  console.log('main resolve all:test event')
  console.log(val)
})

// 监听子窗口
events.on('secondWindow:test', (val) => {
  console.log('main process resolve secondWindow event')
  console.log(val)
})

// 监听主进程/当前
events.on('#:test', (val) => {
  console.log('main process resolve # event')
  console.log(val)
})
events.on('main:test', (val) => {
  console.log('main process resolve main event')
  console.log(val)
})
events.on(':test', (val) => {
  console.log('main process resolve : event')
  console.log(val)
})
events.on('current:test', (val) => {
  console.log('main process resolve current event')
  console.log(val)
})