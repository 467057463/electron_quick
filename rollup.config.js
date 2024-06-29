module.exports = [
  {
    input: 'preload/index.js',
    output: {
      file: 'preload.js',
      format: 'cjs'
    }
  },
  {
    input: 'main/index.js',
    output: {
      file: 'main.js',
      format: 'cjs'
    }
  }
]