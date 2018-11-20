import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import ts from 'rollup-plugin-typescript';
import typescript from 'typescript';
import { terser } from 'rollup-plugin-terser';

const env = process.env.NODE_ENV;
const config = {
  plugins: [
    resolve({
      jsnext: true,
      main: true
      // browser: true,
    }),
    commonjs({
      include: ['node_modules/**', '../common/**']
    }),
    ts({
      typescript
    }),
    json(),
  ],
  output: {
    name: 'ZetaPushUserManagement',
    format: 'umd',
    globals: {
      '@zetapush/common': 'ZetaPushCommon',
      '@zetapush/platform-legacy': 'ZetaPushPlatformLegacy',
      '@zetapush/client': 'ZetaPushClient',
      '@zetapush/worker': 'ZetaPushWorker'
    },
    sourcemap: true
  }
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
