// SPDX-FileCopyrightText: © 2026 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BANNER = `/*! @techandsoftware/teletext
    https://www.npmjs.com/package/@techandsoftware/teletext
    SPDX${''}-FileCopyrightText: (c) ${new Date().getUTCFullYear()} Rob Hardy
    SPDX${''}-License-Identifier: AGPL-3.0-only
 */`;

const terserOptions = {
  ecma: 2016,
  toplevel: true,
  compress: {
    drop_console: true,
    passes: 2,
    pure_getters: true,
    unsafe: true,
    unsafe_symbols: true,
    unsafe_arrows: true
  },
  mangle: {
    properties: {
      regex: "^_.+|.+_$"
    }
  },
  format: {
    comments: /^!|@license|@preserve/i,
    preamble: BANNER
  }
};

export default defineConfig(({ mode }) => {

  const unminified = mode === 'unminified';

  const config = {
    publicDir: "demo",
    build: {
      copyPublicDir: false,
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, "lib/app.js"),
        name: "@techandsoftware/teletext",
        fileName: unminified ? "teletext" : "teletext.min",
        formats: ["es"]
      },
      minify: "terser",
      terserOptions,
    }
  };

  if (unminified) {
    Object.assign(config.build, {
      sourcemap: true,
      rollupOptions: { output: { banner: `\`${BANNER}\`;` } }, // bodge for https://github.com/vitejs/vite/issues/21076
      minify: false,
      terserOptions: undefined,
    });
  }

  return config;
});
