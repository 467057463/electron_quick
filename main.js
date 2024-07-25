'use strict';

var main = require('electron/main');
var path = require('node:path');
var electron = require('electron');
var node_events = require('node:events');

const createWin$1 = (winName) => {
  const win = new main.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [`currentwinName=${winName}`]
    }
  });

  win.loadFile('index.html');
  win.webContents.openDevTools();
  return win;
};

const createWin = (winName) => {
  const win = new main.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [`currentwinName=${winName}`]
    }
  });

  win.loadFile('second.html');
  win.webContents.openDevTools();
  return win;
};

const courseReg = /^(?<course>[a-zA-Z\d]+):(?<name>[a-zA-Z\d]+)$/;
const aliasCourseReg = /^(?<course>[#$@]):(?<name>[a-zA-Z\d]+)$/;
const currentCourseReg = /^:(?<name>[a-zA-Z\d]+)$/;
const allCourseReg = /^(?<name>[a-zA-Z\d]+)$/;

// console.log(once, getEventListeners)

const courseAlias = {
  "$": 'mainWindow',
  // "@": 'all',
  "#": 'main'
};

function generateCourse(eventName){
  let course, name;
  if(eventName.match(courseReg)){
    const r = eventName.match(courseReg);
    course = r.groups.course;
    name = r.groups.name;
  } else if(eventName.match(aliasCourseReg)) {
    const r = eventName.match(aliasCourseReg);
    course =  courseAlias[r.groups.course] ?? r.groups.course;
    name = r.groups.name;
  } else if(eventName.match(currentCourseReg)){
    const r = eventName.match(currentCourseReg);
    course =  'current';
    name = r.groups.name;
  } else if(eventName.match(allCourseReg)){
    const r = eventName.match(allCourseReg);
    course = 'all';
    name = r.groups.name;
  } else {
    course = 'current';
    name = eventName;
  }
  return({
    course, name
  })
}



class Events{
  #instance = new node_events.EventEmitter();

  #initEventPipe(){
    if(process.type === 'renderer'){
      electron.ipcRenderer.on("__eventPipe", (e, {eventName, args}) => {
        this.#instance.emit(eventName, args);
      });
    } else if( process.type === 'browser'){
      electron.ipcMain.on('__eventPipe', (e, { eventName, type, args, ...data }) => {
        switch(type){
          // 直发发主进程
          case 'direct':
            this.#instance.emit(eventName, args);
            break;
          // 转发
          case 'transpond':
            const wins = getWin(data.winName);
            wins.forEach((win) => this.#emitToRender(win, { eventName, args}));
            break;
          // 广播
          case 'broadcast':
            // 主进程
            this.#instance.emit(eventName, args);
            // 除发送的进程以外的所有进程
            electron.BrowserWindow.getAllWindows().forEach((win) => {
              if(win.webContents.id !== e.sender.id){
                this.#emitToRender(win, { eventName, args });
              }
            });
            break;
        }
      });
    }
  }

  #emitToMain(params){
    electron.ipcRenderer.send('__eventPipe', params);
  }

  #emitToRender(win, params){
    win.webContents.send('__eventPipe', params);
  }

  constructor(){
    this.#initEventPipe();
    if(process.type === 'renderer'){
      this.on = this.on.bind(this);
      this.emit = this.emit.bind(this);
      this.off = this.off.bind(this);
    }
  }

  on(eventName, callback){
    const currentProcess = getCurrentWinName();
    const { course, name } = generateCourse(eventName);
    const _eventName = course === 'current' 
      ? `${currentProcess}_${name}` 
      : `${course}_${name}`;
    this.#instance.on(_eventName, callback);
  }

  emit(eventName, args){
    let { course, name } = generateCourse(eventName);
    const currentProcess = getCurrentWinName();
    if(course === currentProcess){
      course = 'current';
    }

    const _eventName = course === 'all' 
      ? `${course}_${name}`
      : `${currentProcess}_${name}`;

    switch(course){
      case 'main':
        if(process.type === 'renderer'){
          this.#emitToMain({ 
            eventName: _eventName, 
            type: 'direct',
            args 
          });
        }
        break;
      case 'all':
        if(process.type === 'renderer'){
          // 触发当前窗口
          this.#instance.emit(_eventName, args);
          // 触发到主进程并广播到其他窗口
          this.#emitToMain({ 
            eventName: _eventName, 
            type: 'broadcast',
            args
          });
        } else {
          // 主进程的
          this.#instance.emit(_eventName, args);
          // 所有窗口
          electron.BrowserWindow.getAllWindows().forEach((win) => {
            this.#emitToRender(win, { eventName: _eventName, args });
          });
        }
        break;
      case 'current':
        this.#instance.emit(`${currentProcess}_${name}`, args);
        break;
      default:
        if(process.type === 'renderer'){
          this.#emitToMain({ 
            eventName: _eventName, 
            type: 'transpond',
            winName: course,
            args,
          });
        } else {
          const wins = getWin(course);
          wins.forEach((win) => this.#emitToRender(win, { eventName: _eventName, args}));
        }
        break
    }
  }

  off(eventName){
    const { course, name } = generateCourse(eventName);
    const _eventName = course === 'all' ? `${course}_${name}` : name;
    this.#instance.removeListener(_eventName);
  }
}

var events = new Events();

const browserMap = new Map();

function createWindow(createWin, winName){
  const win = createWin(winName);

  if(!browserMap.has(winName)){
    const browserSet = new Set();
    browserSet.add(win);
    browserMap.set(winName, browserSet);
  } else {
    const browserSet = browserMap.get(winName);
    browserSet.add(win);
  }

  win.on('closed', () => {
    const browserSet = browserMap.get(winName);
    browserSet.delete(win);
  });
  return win;
}

function getWin(name){
  if(name){
    const browserSet = browserMap.get(name);
    return browserSet
  } else {
    return Array.from(browserMap.entries()).reduce((prev, [winName, browserSet]) => {
      return {
        ...prev,
        [winName]: browserSet
      }
    }, {})
  }
}


function getCurrentWinName(){
  if(process.type === 'browser'){
    return 'main'
  } else {
    const key = 'currentwinName=';
    for(let arg of process.argv){
      if(arg.startsWith(key)){
        return arg.replace(key, '')
      }
    }
  }
}

// import events, { createWindow } from '../plugins/events/dist/main.js'

const contextMenu = main.Menu.buildFromTemplate([
  {
    label: '主进程',
    submenu: [
      { 
        label: '#:test',
        click: () => {
          console.log('#:test');
          events.emit('#:test', 'test main');
        }
      },
      {
        label: 'main:test',
        click: () => {
          console.log('main:test');
          events.emit('main:test', 'test main');
        }
      },
      {
        label: ':test',
        click: () => {
          console.log(':test');
          events.emit(':test', 'test main');
        }
      },
      {
        label: 'current:test',
        click: () => {
          console.log('current:test');
          events.emit('current:test', 'test main');
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
          console.log('$:test');
          events.emit('$:test', 'test main');
        }
      },
      {
        label: 'mainWindow:test',
        click: () => {
          console.log('mainWindow:test');
          events.emit('mainWindow:test', 'test mainWindow');
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
          console.log('secondWindow:test');
          events.emit('secondWindow:test', 'test secondWindow');
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
          console.log('test');
          events.emit('test', 'test secondWindow all');
        } 
      },
    ]
  }
]);

main.Menu.setApplicationMenu(contextMenu);

main.app.whenReady().then(() => {
  createWindow(createWin$1, 'mainWindow');
  setTimeout(() => {
    createWindow(createWin, 'secondWindow');
  }, 1000);
  main.app.on('activate', () => {
    if(main.BrowserWindow.getAllWindows().length === 0){
      createWindow(createWin$1, 'mainWindow');
    }
  });
});

main.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin'){
    main.app.quit();
  }
});

main.ipcMain.on('test', (e, args) => {
  console.log(e, args);
  e.returnValue = 'sssssbbbbb ssss';
});




// 监听主窗口
events.on('$:test', (val) => {
  console.log('main resolve $:test event');
  console.log(val);
});
events.on('mainWindow:test', (val) => {
  console.log('main resolve mainWindow:test event');
  console.log(val);
});

// 测试 all
events.on('test', (val) => {
  console.log('main resolve all:test event');
  console.log(val);
});

// 监听子窗口
events.on('secondWindow:test', (val) => {
  console.log('main process resolve secondWindow event');
  console.log(val);
});

// 监听主进程/当前
events.on('#:test', (val) => {
  console.log('main process resolve # event');
  console.log(val);
});
events.on('main:test', (val) => {
  console.log('main process resolve main event');
  console.log(val);
});
events.on(':test', (val) => {
  console.log('main process resolve : event');
  console.log(val);
});
events.on('current:test', (val) => {
  console.log('main process resolve current event');
  console.log(val);
});
//# sourceMappingURL=main.js.map
