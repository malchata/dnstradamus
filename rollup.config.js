import babel from "rollup-plugin-babel";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const commonTerserOptions = {
  output: {
    preamble: `/*dnstradamus ${pkg.version}*/`,
  },
  timings: true
};

export default [
  {
    input: pkg.module,
    output: {
      file: "dist/dnstradamus.min.mjs",
      format: "esm"
    },
    plugins: [
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
        ...commonTerserOptions
      })
    ]
  },
  {
    input: pkg.module,
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
        ...commonTerserOptions
      })
    ]
  },
  {
    input: pkg.module,
    output: {
      file: pkg.main,
      format: "cjs"
    },
    plugins: [
      copy({
        "dist/dnstradamus.min.js": "test/js/dnstradamus.min.js",
        "dist/dnstradamus.min.mjs": "test/js/dnstradamus.min.mjs"
      })
    ]
  }
];
