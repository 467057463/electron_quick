const path = require('node:path');
const jscc = require('rollup-plugin-jscc');

module.exports = [
  // 主进程
  {
    input: 'plugins/events/index.js',
    output: {
      file: 'plugins/events/dist/main.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      jscc({
        values: { 
          _ENV: 'MAIN'
        },
      })
    ]
  },
]