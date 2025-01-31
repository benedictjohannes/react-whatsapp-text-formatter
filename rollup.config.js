import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: 'src/WhatsappTextMsgFormatter.tsx',
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs',
                exports: 'default',
                sourcemap: true,
            },
            {
                file: 'dist/index.esm.js',
                format: 'es',
                exports: 'default',
                sourcemap: true,
            },
        ],
        plugins: [
            typescript({
                declaration: true,
                outDir: './dist',
            }),
            resolve(),
            commonjs(),
            terser(),
        ],
        external: ['react', 'react-dom'],
    },
]
