
import { ipcMain, ipcRenderer, BrowserWindow } from 'electron';
import { EventEmitter, once, getEventListeners } from 'node:events';

const courseReg = /^(?<course>[a-zA-Z\d]+):(?<name>[a-zA-Z\d]+)$/;
const aliasCourseReg = /^(?<course>[#$@]):(?<name>[a-zA-Z\d]+)$/;
const currentCourseReg = /^:(?<name>[a-zA-Z\d]+)$/;
const allCourseReg = /^(?<name>[a-zA-Z\d]+)$/;

console.log(once, getEventListeners)

const courseAlias = {
  "$": 'mainWindow',
  "@": 'all',
  "#": 'main'
}

function generateCourse(eventName){
  let course, name;
  if(eventName.match(courseReg)){
    const r = eventName.match(courseReg);
    course = r.groups.course
    name = r.groups.name
  } else if(eventName.match(aliasCourseReg)) {
    const r = eventName.match(aliasCourseReg);
    course =  courseAlias[r.groups.course] ?? r.groups.course
    name = r.groups.name
  } else if(eventName.match(currentCourseReg)){
    const r = eventName.match(currentCourseReg);
    course =  'current'
    name = r.groups.name
  } else if(eventName.match(allCourseReg)){
    const r = eventName.match(allCourseReg);
    course = 'all'
    name = r.groups.name
  } else {
    course = 'current'
    name = eventName
  }
  return({
    course, name
  })
}



class Events{
  #instance = new EventEmitter();

  constructor(){
    this.#initEventPipe();
    if(process.type === 'renderer'){
      this.on = this.on.bind(this)
      this.emit = this.emit.bind(this)
      this.off = this.off.bind(this)
    }
  }

  #initEventPipe(){
    if(process.type === 'renderer'){
      ipcRenderer.on("__eventPipe", (e, {eventName, emiter, args}) => {
        this.#instance.emit(eventName, emiter, args)
      })
    } else if( process.type === 'browser'){
      ipcMain.on('__eventPipe', (e, { eventName, transpond, broadcast, winName, args }) => {
        const emiter = getWinName(BrowserWindow.fromWebContents(e.sender));
        console.log(e, { eventName, transpond, broadcast, winName, emiter, args })
        if(transpond){
          const wins = getWin(winName);
          wins.forEach((win) => this.#emitToRender(win, { eventName, emiter, args}))
        } else if(broadcast) {
          this.#instance.emit(eventName, emiter, args)
          BrowserWindow.getAllWindows().forEach((win) => {
            if(win.id !== e.sender.id){
              this.#emitToRender(win, { eventName, emiter, args })
            }
          })
        } else {
          this.#instance.emit(eventName, emiter, args)
        }
      })
    }
  }

  #emitToMain({eventName, ...rest}){
    ipcRenderer.send('__eventPipe', {
      eventName,
      ...rest
    })
  }

  #emitToRender(win, {eventName, ...rest}){
    win.webContents.send('__eventPipe', {
      eventName, ...rest
    })
  }

  on(eventName, callback){
    const currentProcess = getCurrentWinName();
    const { course, name } = generateCourse(eventName);
    const _eventName = course === 'all' ? `${course}_${name}` : name;
    const cb = (emiter, ...args) => {
      console.log(currentProcess, emiter, course, args);
      if(course === 'all'){
        callback(...args);
      } else if(emiter === course) {
        callback(...args);
      } else if(currentProcess === emiter && course === 'current'){
        callback(...args);
      }
    }
    cb.__course = course
    this.#instance.on(_eventName, cb);
  }

  emit(eventName, args){
    const { course, name } = generateCourse(eventName);
    const emiter = getCurrentWinName();
    switch(course){
      case 'main':
        if(process.type === 'renderer'){
          this.#emitToMain({ eventName: `${name}`, emiter, args })
        }
        break;
      case 'all':
        if(process.type === 'renderer'){
          this.#instance.emit(`${course}_${name}`, emiter, args);
          this.#emitToMain({ 
            eventName: `${course}_${name}`, 
            broadcast: true,
            emiter,
            args
          })
        }
        break;
      case 'current':
        this.#instance.emit(`${name}`, emiter, args);
        break;
      default:
        if(process.type === 'renderer'){
          if(course === emiter){
            this.#instance.emit(`${name}`, emiter, args);
          } else {
            this.#emitToMain({ 
              eventName: `${name}`, 
              transpond: true,
              winName: course,
              args,
              course,
            })
          }
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

export default new Events()

export const browserMap = new Map();

export function createWindow(createWin, winName){
  const win = createWin(winName);

  if(!browserMap.has(winName)){
    const browserSet = new Set();
    browserSet.add(win)
    browserMap.set(winName, browserSet)
  } else {
    const browserSet = browserMap.get(winName)
    browserSet.add(win)
  }

  win.on('closed', () => {
    const browserSet = browserMap.get(winName)
    browserSet.delete(win)
  })
  return win;
}

function getWin(name){
  if(name){
    const browserSet = browserMap.get(name)
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

function getWinName(win){
  for(const [name, browserSet] of Array.from(browserMap.entries())){
    if(browserSet.has(win)){
      return name;
    }
  }
}

function getCurrentWinName(){
  if(process.type === 'browser'){
    return 'main'
  } else {
    const key = 'currentwinName='
    for(let arg of process.argv){
      if(arg.startsWith(key)){
        return arg.replace(key, '')
      }
    }
  }
}