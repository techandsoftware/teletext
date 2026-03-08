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


export default defineConfig(({ mode }) => {

  const isMinified = mode === "minified";

  // used for minified buld
  const terserConfig = {
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
      preserve_annotations: true,
      preamble: BANNER
    }
  };

  return {
    publicDir: "demo",
    build: {
      copyPublicDir: false,
      emptyOutDir: false,
      sourcemap: !isMinified,
      lib: {
        entry: resolve(__dirname, "lib/app.js"),
        name: "@techandsoftware/teletext",
        fileName: isMinified ? "teletext.min" : "teletext",
        formats: ["es"]
      },
      minify: isMinified ? "terser" : false,
      terserOptions: isMinified ? terserConfig : undefined
    }
  }
});
