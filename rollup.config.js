import resolve from '@rollup/plugin-node-resolve';
import browsersync from 'rollup-plugin-browsersync';
import sourcemaps from 'rollup-plugin-sourcemaps';
import json from '@rollup/plugin-json';

export default {
  input: {
    teletext: 'src/app.js',
  },
  output: {
    entryFileNames: '[name].js',
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    browsersync({
      server: '.',
      startPath: "/demo/es6_import.html"
    }),
    sourcemaps(),
    json(),
  ]
};
