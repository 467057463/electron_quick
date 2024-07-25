window.addEventListener('DOMContentLoaded', () => {
  // 主窗口
  document.querySelector('#main_windows_').addEventListener('click', () => {
    console.log('$')
    electron.events.emit('$:test', 'second window $ aaaaaa')
  })
  document.querySelector('#main_windows').addEventListener('click', () => {
    console.log('main_windows')
    electron.events.emit('mainWindow:test', 'second window main_window aaaaaa')
  })

  // 主进程
  document.querySelector('#main_').addEventListener('click', () => {
    console.log('#')
    electron.events.emit('#:test', 'second window # aaaaaa')
  })
  document.querySelector('#main').addEventListener('click', () => {
    console.log('main')
    electron.events.emit('main:test', 'second window main aaaaaa')
  })

  // 当前窗口
  document.querySelector('#second_window').addEventListener('click', () => {
    console.log('secondWindow')
    electron.events.emit('secondWindow:test', 'second window secondWindow aaaaaa')
  })
  document.querySelector('#current_').addEventListener('click', () => {
    console.log(':test')
    electron.events.emit(':test', 'second window :test aaaaaa')
  })
  document.querySelector('#current').addEventListener('click', () => {
    console.log('current:test')
    electron.events.emit('current:test', 'second window current:test aaaaaa')
  })

  // all
  document.querySelector('#all').addEventListener('click', () => {
    console.log('test')
    electron.events.emit('test', 'second window test aaaaaa')
  })
})




// 监听主窗口
electron.events.on('$:test', (val) => {
  console.log('second windows resolve $:test event')
  console.log(val)
})

electron.events.on('mainWindow:test', (val) => {
  console.log('second windows resolve mainWindow:test event')
  console.log(val)
})

// 测试 all
electron.events.on('test', (val) => {
  console.log('second windows resolve all:test event')
  console.log(val)
})

// 监听当前窗口/主窗口
electron.events.on('secondWindow:test', (val) => {
  console.log('second windows resolve secondWindow:test event')
  console.log(val)
})
electron.events.on(':test', (val) => {
  console.log('second windows resolve :test event')
  console.log(val)
})
electron.events.on('current:test', (val) => {
  console.log('second windows resolve current:test event')
  console.log(val)
})
// 监听主进程
electron.events.on('#:test', (val) => {
  console.log('second windows resolve # event')
  console.log(val)
})
electron.events.on('main:test', (val) => {
  console.log('second windows resolve main event')
  console.log(val)
})


