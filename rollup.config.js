/* eslint-env node */

import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";

// Config shorthands
const input = "./src/index.ts";

export default [
  // ESM build
  {
    input,
    output: {
      file: pkg.module,
      format: "esm",
      exports: "named"
    },
    plugins: [
      typescript({
        target: "ES6",
        module: "ESNext"
      }),
    ]
  },
  // CommonJS build
  {
    input,
    output: {
      file: pkg.main,
      format: "cjs",
      exports: "named"
    },
    plugins: [
      typescript({
        module: "CommonJS"
      }),
      commonjs({
        extensions: [
          ".js",
          ".ts"
        ]
      })
    ]
  }
];
