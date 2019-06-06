import { terser } from 'rollup-plugin-terser';
// import resolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
// import json from 'rollup-plugin-json';
import builtins from 'builtin-modules'

export default {
    input: 'src/index.mjs',
    plugins: [terser()],
    external: [...builtins, 'conventional-changelog-core', 'conventional-changelog-conventionalcommits'],
    output: {
        file: 'dist/changelogGenerator.mjs',
        format: 'esm'
    }
};
