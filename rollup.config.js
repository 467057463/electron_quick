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
  // preload
  // {
  //   input: 'plugins/events/index.js',
  //   output: {
  //     file: 'plugins/events/dist/preload.js',
  //     format: 'es',
  //     sourcemap: true,
  //   },
  //   plugins: [
  //     jscc({
  //       values: { 
  //         _ENV: 'RENDERER'
  //       },
  //     })
  //   ]
  // },
  {
    input: 'preload/index.js',
    output: {
      file: 'preload.js',
      format: 'cjs',
      sourcemap: true,
      sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
        // 将会把相对路径替换为绝对路径
        return path.resolve(
            path.dirname(sourcemapPath),
            relativeSourcePath
        );
      },
    }
  },
  {
    input: 'main/index.js',
    output: {
      file: 'main.js',
      format: 'cjs',
      sourcemap: true,
      sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
        // 将会把相对路径替换为绝对路径
        return path.resolve(
            path.dirname(sourcemapPath),
            relativeSourcePath
        );
      },
    }
  }
]