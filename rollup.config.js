// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import resolve from '@rollup/plugin-node-resolve';
import browsersync from 'rollup-plugin-browsersync';
import json from '@rollup/plugin-json';

const OUTPUT_BANNER = `// SPDX${''}-FileCopyrightText: (c) 2021 Tech and Software Ltd.
// SPDX${''}-FileCopyrightText: (c) 2017 dosaygo
// SPDX${''}-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0
// LicenseRef-uk.ltd.TechAndSoftware-1.0 refers to https://techandsoftware.robdev.org.uk/LICENSES/LicenseRef-uk.ltd.TechAndSoftware-1.0.txt`;


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
    banner: OUTPUT_BANNER
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
