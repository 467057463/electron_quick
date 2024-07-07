import { contextBridge } from "electron";
import events from '../plugins/events.js';
console.log('hello render.js')

contextBridge.exposeInMainWorld('electron', {
  chrome: () => process.versions.chrome,
  node: () => process.versions.node,
  electron: () => process.versions.electron,
  events
})

