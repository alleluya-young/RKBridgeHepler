import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'default',
      },
      {
        file: 'dist/index.es.js',
        format: 'es',
        exports: 'default',
        entryFileNames: '[name].es.js',
        chunkFileNames: '[name]-[hash].es.js',
      },
    ],
    plugins: [
      commonjs(),
      resolve({
        extensions: ['.ts', '.js'],
      }),
      babel({
        configFile: '../babel.config.json',
        babelHelpers: 'bundled',
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
      }),
    ],
  },
];
