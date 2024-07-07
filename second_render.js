electron.events.on('test', (val) => {
  console.log('second windows resolve all:test event')
  console.log(val)
})

electron.events.on('$:test', (val) => {
  console.log('second windows resolve mainWindows:test event')
  console.log(val)
})