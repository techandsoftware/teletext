// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import sourcemaps from 'rollup-plugin-sourcemaps';
import json from '@rollup/plugin-json';

// preamble in the minified source
const OUTPUT_BANNER = `// SPDX${''}-FileCopyrightText: (c) 2021 Tech and Software Ltd.
// SPDX${''}-FileCopyrightText: (c) 2017 dosaygo
// SPDX${''}-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0`;

export default {
  input: 'src/app.js',
  output: [
    {
      file: 'dist/teletext.min.js',
      format: 'es',
      sourcemap: true,
      compact: true,
      preferConst: true,
    },{
      file: 'dist/teletext.umd.min.js',
      format: 'umd',
      name: 'ttx',
      preferConst: true,
      sourcemap: true,
      compact: true,
    },{
      file: 'dist/teletext.min.cjs',
      format: 'cjs',
      preferConst: true,
      sourcemap: true,
      compact: true,
    }
  ],
  plugins: [
    terser({
      ecma: 2016,
      toplevel: true,
      compress: {
        drop_console: true,
        passes: 2,
        pure_getters: true,
        unsafe: true,
        unsafe_symbols: true,
        unsafe_arrows: true,
      },
      mangle: {
        properties: {
          regex: /^_.+/,
        },
      },
      format: {
        preamble: OUTPUT_BANNER
      }
    }),
    resolve(),
    sourcemaps(),
    json(),
  ],
};
