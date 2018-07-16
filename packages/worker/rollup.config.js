import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import ts from 'rollup-plugin-typescript';
import typescript from 'typescript'
import { uglify } from 'rollup-plugin-uglify';
import { minify as minifier } from 'uglify-es';

const env = process.env.NODE_ENV;
const config = {
  plugins: [
    resolve({
      jsnext: true,
      main: true,
    }),
    commonjs({
      include: ['node_modules/**', '../cometd/**', '../core/**', '../platform/**']
    }),
    ts({
      typescript
    }),
    json(),
  ],
  output: {
    format: 'umd',
    globals: {
      '@zetapush/core': 'ZetaPush',
      '@zetapush/platform': 'ZetaPushPlatform'
    },
    name: 'ZetaPushWorker',
    sourcemap: true
  },
};

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    }, minifier),
  );
}

export default config;
