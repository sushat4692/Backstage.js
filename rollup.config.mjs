// 各種プラグインを読み込む
import pluginNodeResolve from '@rollup/plugin-node-resolve'
import pluginCommonjs from '@rollup/plugin-commonjs'
import pluginTypescript from '@rollup/plugin-typescript'
import { babel as pluginBabel } from '@rollup/plugin-babel'
import pluginTerser from '@rollup/plugin-terser'

import path from 'path'

import pkg from './package.json' assert { type: 'json' }

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ライブラリに埋め込むcopyright
const banner = `/*!
  ${pkg.name.replace(/^@.*\//, '')} v${pkg.version}
  ${pkg.homepage}
  Released under the ${pkg.license} License.
*/`

export default [
    // ブラウザ用設定
    {
        // エントリポイント
        input: 'src/Backstage.ts',
        output: [
            // minifyせずに出力する
            {
                // exportされたモジュールを格納する変数
                name: 'Backstage',
                // 出力先ファイル
                file: pkg.browser,
                // ブラウザ用フォーマット
                format: 'iife',
                // ソースマップをインラインで出力
                sourcemap: 'inline',
                // copyright
                banner,
            },
            // minifyして出力する
            {
                name: 'Backstage',
                // minifyするので.minを付与する
                file: pkg.browser.replace('.js', '.min.js'),
                format: 'iife',
                banner,
                // minify用プラグインを追加で実行する
                plugins: [pluginTerser()],
            },
        ],
        plugins: [
            pluginTypescript({
                declaration: true,
                rootDir: 'src',
                declarationDir: 'types',
            }),
            pluginCommonjs({
                extensions: ['.js', '.ts'],
            }),
            pluginBabel({
                babelHelpers: 'bundled',
                configFile: path.resolve(__dirname, '.babelrc.js'),
            }),
            pluginNodeResolve({
                browser: true,
            }),
        ],
    },
    // ESモジュール用設定
    {
        input: `src/index.ts`,
        output: [
            {
                file: pkg.module,
                format: 'es',
                sourcemap: 'inline',
                banner,
                exports: 'named',
            },
        ],
        // 他モジュールは含めない
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.devDependencies || {}),
        ],
        plugins: [
            pluginTypescript(),
            pluginBabel({
                babelHelpers: 'bundled',
                configFile: path.resolve(__dirname, '.babelrc.js'),
            }),
        ],
    },
    // CommonJS用設定
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: 'inline',
                banner,
                exports: 'named',
            },
        ],
        // 他モジュールは含めない
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.devDependencies || {}),
        ],
        plugins: [
            pluginTypescript(),
            pluginBabel({
                babelHelpers: 'bundled',
                configFile: path.resolve(__dirname, '.babelrc.js'),
            }),
        ],
    },
]
