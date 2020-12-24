/* eslint-env node */

import babel from "rollup-plugin-babel";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const input = "./src/dnstradamus.mjs";

export default [
  // Uglified ESM build
  {
    input,
    output: {
      file: "dist/dnstradamus.min.mjs",
      format: "esm"
    },
    plugins: [
      babel({
        presets: [
          [
            "@babel/preset-env", {
              targets: {
                esmodules: true
              },
              loose: true
            }
          ]
        ]
      }),
      terser({
        ecma: 8,
        mangle: {
          keep_fnames: true,
          toplevel: true,
          reserved: ["dnstradamus"],
          module: true
        },
        compress: {
          unsafe_arrows: true,
          module: true
        },
        timings: true
      })
    ]
  },
  // Uglified IIFE (browser) build
  {
    input,
    output: {
      name: "dnstradamus",
      file: "dist/dnstradamus.min.js",
      format: "iife"
    },
    plugins: [
      babel({
        presets: [
          [
            "@babel/preset-env", {
              targets: ">0.25%, last 2 versions, Firefox ESR",
              loose: true
            }
          ]
        ]
      }),
      terser({
        ecma: 5,
        mangle: {
          keep_fnames: true,
          toplevel: true,
          reserved: ["dnstradamus"]
        },
        timings: true
      })
    ]
  },
  // ESM build
  {
    input,
    output: {
      file: pkg.module,
      format: "esm",
      exports: "default"
    }
  },
  // CommonJS build
  {
    input,
    output: {
      file: pkg.main,
      format: "cjs",
      exports: "default"
    },
    plugins: [
      copy({
        "dist/dnstradamus.min.js": "test/js/dnstradamus.min.js",
        "dist/dnstradamus.min.mjs": "test/js/dnstradamus.min.mjs"
      })
    ]
  }
];
