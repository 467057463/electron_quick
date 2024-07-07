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

  document.querySelector('#all').addEventListener('click', () => {
    console.log('all')
    electron.events.emit('@:test', 'all windows aaaaaa')
  })

  document.querySelector('#current').addEventListener('click', () => {
    console.log('current')
    electron.events.emit(':test', 'current aaaaaa')
  })

  document.querySelector('#second_win').addEventListener('click', () => {
    console.log('second_win')
    electron.events.emit('secondWindow:test', 'second_win aaaaaa')
  })

  document.querySelector('#main_process').addEventListener('click', () => {
    console.log('main_process')
    electron.events.emit('#:test', 'main process aaaaaa')
  })

  document.querySelector('#main_win').addEventListener('click', () => {
    console.log('main_win')
    electron.events.emit('mainWindow:test', 'mainWindow aaaaaa')
  })
})


electron.events.on(':test', (val) => {
  console.log(this, val)
})

electron.events.on('test', (val) => {
  console.log(val)
})

electron.events.on('mainWindow:test', (val) => {
  console.log(val)
})

// electron.events.emit('test', 'on all aaaaaa')

// electron.events.emit(':test', 'current aaaaaa')

// electron.events.emit('#test', 'main process aaaaaa')

// electron.events.emit('$:test', 'main windows aaaaaa')

// // electron.events.emit('@:test', 'all windows aaaaaa')
