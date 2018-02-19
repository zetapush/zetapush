import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

const env = process.env.NODE_ENV;
const config = {
  plugins: [
    resolve({
      jsnext: true,
      main: true,
    }),
    commonjs({
      include: ['node_modules/**', '../cometd/**'],
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    json(),
  ],
  output: {
    name: 'ZetaPushPlatform',
    format: 'umd',
    sourcemap: true,
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
    }),
  );
}

export default config;
