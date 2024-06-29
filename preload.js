'use strict';

var electron = require('electron');
var EventEmitter = require('node:events');

const courseReg = /^(?<course>[a-zA-Z\d]+):(?<name>[a-zA-Z\d]+)$/;
const aliasCourseReg = /^(?<course>[#$@]):(?<name>[a-zA-Z\d]+)$/;
const currentCourseReg = /^:(?<name>[a-zA-Z\d]+)$/;
const allCourseReg = /^(?<name>[a-zA-Z\d]+)$/;

const courseAlias = {
  "$": 'mainWindow',
  "@": 'all'
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
    name = r.groups.name;
  }
  return({
    course, name
  })
}

class Events{
  #instance = new EventEmitter();
  #courseEventsMap = new Map();

  constructor(){
    this.#initEventPipe();
    if(process.type === 'renderer'){
      this.on = this.on.bind(this);
      this.emit = this.emit.bind(this);
      this.off = this.off.bind(this);
    }
  }

  #initEventPipe(){
    if(process.type === 'renderer'){
      electron.ipcRenderer.on("__eventPipe", (e, {eventName, args}) => {
        this.#instance.emit(eventName, args);
      });
    } else if( process.type === 'browser'){
      electron.ipcMain.on('__eventPipe', (e, { eventName, args }) => {
        this.#instance.emit(eventName, args);
      });
    }
  }

  #emitToMain({eventName, args}){
    electron.ipcRenderer.send('__eventPipe', {
      eventName,
      args
    });
  }

  on(eventName, callback){
    const { course, name } = generateCourse(eventName);
    this.#courseEventsMap.set(course, name);
    this.#instance.on(name, callback);
  }

  emit(eventName, args){
    const { course, name } = generateCourse(eventName);
    switch(course){
      case 'main':
        this.#emitToMain({ eventName: name, args });
        break;
      case 'all':

        break;
      case 'current':
        this.#instance.emit(name, args);
        break;
      default:
        this.#instance.emit(name, args);
        break
    }
  }

  off(eventName){
    this.#instance.removeListener(eventName);
  }
}

var events = new Events();

console.log('hello preload.js', events, electron.events);

// window.addEventListener('DOMContentLoaded', () => {
//   const r = ipcRenderer.sendSync('test')
//   console.log('r', r)
// })


electron.contextBridge.exposeInMainWorld('electron', {
  chrome: () => process.versions.chrome,
  node: () => process.versions.node,
  electron: () => process.versions.electron,
  test: {
    name: 'mm'
  },
  events
});
