console.log('hello renderer.js')
console.log(electron)

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, electron[dependency]())
  }
})


electron.events.on('test', (val) => {
  console.log(val)
})

electron.events.emit('test', 'on all aaaaaa')

electron.events.emit(':test', 'current aaaaaa')

electron.events.emit('#test', 'main process aaaaaa')

electron.events.emit('$:test', 'main windows aaaaaa')

// electron.events.emit('@:test', 'all windows aaaaaa')
