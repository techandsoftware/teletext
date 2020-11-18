import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'; // needed for js-hqx
import browsersync from 'rollup-plugin-browsersync';
import sourcemaps from 'rollup-plugin-sourcemaps';
import json from '@rollup/plugin-json';

export default {
  input: {
    teletextjs: 'src/app.js',
    DemoApp: 'src/DemoApp.js'
  },
  output: {
    entryFileNames: '[name].js',
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
  external: '../dist/teletextjs.js',
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**/hqx.js'
    }),
    browsersync({
      server: '.'
    }),
    sourcemaps(),
    json(),
  ]
};
