import { contextBridge, ipcRenderer, events as e } from "electron";
import events from '../plugins/events.js';

console.log('hello preload.js', events, e)

// window.addEventListener('DOMContentLoaded', () => {
//   const r = ipcRenderer.sendSync('test')
//   console.log('r', r)
// })


contextBridge.exposeInMainWorld('electron', {
  chrome: () => process.versions.chrome,
  node: () => process.versions.node,
  electron: () => process.versions.electron,
  test: {
    name: 'mm'
  },
  events
})

