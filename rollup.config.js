import { nodeResolve } from '@rollup/plugin-node-resolve';
import browsersync from 'rollup-plugin-browsersync';

export default {
    input: 'src/app.js',
    output: {
        file: 'dist/appbundle.js',
        format: 'es'
  },
  plugins: [
    nodeResolve(),
    browsersync({
      server: '.'
    })
  ]
};
