import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import sourcemaps from 'rollup-plugin-sourcemaps';
import json from '@rollup/plugin-json';

export default {
  input: 'src/app.js',
  output: [
    {
      file: 'dist/teletextjs.min.js',
      format: 'es',
      sourcemap: true,
      compact: true,
      preferConst: true,
    },{
      file: 'dist/teletextjs.umd.min.js',
      format: 'umd',
      name: 'teletextjs',
      preferConst: true,
      sourcemap: true,
    }
  ],
  plugins: [
    terser(),
    nodeResolve(),
    sourcemaps(),
    json(),
  ],
};
