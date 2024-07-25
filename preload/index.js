import { contextBridge } from "electron";
import events from '../plugins/events.js';
// import events from '../plugins/events/dist/preload.js'
console.log('hello render.js')

contextBridge.exposeInMainWorld('electron', {
  chrome: () => process.versions.chrome,
  node: () => process.versions.node,
  electron: () => process.versions.electron,
  events
})

