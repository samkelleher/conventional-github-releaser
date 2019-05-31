import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
    input: 'index.mjs',
    output: {
        file: 'dist/changelogGenerator.mjs',
        format: 'esm'
    },
    name: 'changelogGenerator',
    plugins: [
        // resolve(),
        // commonjs(),
        // json()
    ]
};
