import { nodeResolve } from '@rollup/plugin-node-resolve';
import browsersync from 'rollup-plugin-browsersync';

export default {
    input: 'src/svgtest.js',
    output: {
        file: 'dist/svgtestbundle.js',
        format: 'es'
  },
  plugins: [
    nodeResolve(),
    browsersync({
      server: '.'
    })
  ]
};
