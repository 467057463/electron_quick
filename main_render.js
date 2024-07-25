console.log('hello renderer.js')
console.log(electron)

window.addEventListener('DOMContentLoaded', () => {
  // 主窗口/当前窗口
  document.querySelector('#main_windows_').addEventListener('click', () => {
    console.log('$')
    electron.events.emit('$:test', 'main window $ aaaaaa')
  })
  document.querySelector('#main_windows').addEventListener('click', () => {
    console.log('main_windows')
    electron.events.emit('mainWindow:test', 'main window main_window aaaaaa')
  })
  document.querySelector('#current_').addEventListener('click', () => {
    console.log(':test')
    electron.events.emit(':test', 'main window :test aaaaaa')
  })
  document.querySelector('#current').addEventListener('click', () => {
    console.log('current:test')
    electron.events.emit('current:test', 'main window current:test aaaaaa')
  })

  // 主进程
  document.querySelector('#main_').addEventListener('click', () => {
    console.log('#')
    electron.events.emit('#:test', 'main window # aaaaaa')
  })
  document.querySelector('#main').addEventListener('click', () => {
    console.log('main')
    electron.events.emit('main:test', 'main window main aaaaaa')
  })

  // 子窗口
  document.querySelector('#second_window').addEventListener('click', () => {
    console.log('secondWindow')
    electron.events.emit('secondWindow:test', 'main window secondWindow aaaaaa')
  })

  // all
  document.querySelector('#all').addEventListener('click', () => {
    console.log('all')
    electron.events.emit('test', 'all windows aaaaaa')
  })
})





// 监听主窗口/当前窗口
electron.events.on('mainWindow:test', (val) => {
  console.log('main windows resolve mainWindows:test event')
  console.log(val)
})
electron.events.on('$:test', (val) => {
  console.log('main windows resolve $:test event')
  console.log(val)
})
electron.events.on(':test', function(val) {
  console.log('main windows resolve :test event')
  console.log(this, val)
})
electron.events.on('current:test', function(val) {
  console.log('main windows resolve current:test event')
  console.log(this, val)
})

// 测试 all
electron.events.on('test', (val) => {
  console.log('main windows resolve all event')
  console.log(val)
})


// 监听子窗口
electron.events.on('secondWindow:test', (val) => {
  console.log('main windows resolve secondWindow event')
  console.log(val)
})

// 监听主进程
electron.events.on('#:test', (val) => {
  console.log('main windows resolve # event')
  console.log(val)
})
electron.events.on('main:test', (val) => {
  console.log('main windows resolve main event')
  console.log(val)
})