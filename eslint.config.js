// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["dist/**", "coverage/**"] },
  {
    files: ["lib/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      "complexity": ["warn", 10]
    },
    languageOptions: {
      globals: globals.browser
    }
  },
]);
