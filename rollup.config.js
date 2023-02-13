// SPDX-FileCopyrightText: © 2023 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import resolve from '@rollup/plugin-node-resolve';
import browsersync from 'rollup-plugin-browsersync';
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
    sourcemapExcludeSources: true,
  },
  plugins: [
    resolve(),
    browsersync({
      server: '.',
      startPath: "/demo/es6_import_live_reload.html"
    }),
    json(),
  ]
};
