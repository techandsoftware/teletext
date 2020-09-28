import { nodeResolve } from '@rollup/plugin-node-resolve';
import browsersync from 'rollup-plugin-browsersync';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input: 'src/app.js',
    output: {
        file: 'dist/appbundle.js',
        format: 'es',
        sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    browsersync({
      server: '.'
    }),
    sourcemaps(),
  ]
};
