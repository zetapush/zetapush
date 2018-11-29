import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import ts from 'rollup-plugin-typescript';
import typescript from 'typescript'
import { terser } from 'rollup-plugin-terser';

const env = process.env.NODE_ENV;
const config = {
  plugins: [
    resolve({
      jsnext: true,
      main: true,
    }),
    commonjs({
      include: ['node_modules/**'],
    }),
    ts({
      typescript
    }),
    json(),
  ],
  output: {
    format: 'cjs',
    sourcemap: true,
  },
};

if (env === 'production') {
  config.plugins.push(
    terser(
      {
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      },
    ),
  );
}

export default config;
