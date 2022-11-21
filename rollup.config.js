import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import bundleSize from "rollup-plugin-bundle-size";
import autoExternal from "rollup-plugin-auto-external";

import packageJson from "./package.json";

import { minify } from "terser";

const extensions = [".ts"];
const name = packageJson.name;
const banner = `/**
    * ${packageJson.homepage}
    * (c) ${new Date().getFullYear()} ${packageJson.author}
    * @license ${packageJson.license}
    */
`;

const input = "lib/urbex.ts";
const target = "last 3 years, not dead";

async function minifyCode() {
    return {
        name: "terser",
        async renderChunk(code, _, options = {}) {
            const minified = await minify(code, {
                module: options.format === "esm",
                sourceMap: true,
                toplevel: true,
                compress: {
                    passes: 2
                },
                mangle: {
                    properties: {
                        regex: /^_/
                    }
                }
            });

            return {
                code: minified.code,
                map: minified.map
            };
        }
    };
}

const create = (config) => ({
    input: input,
    output: {
        ...config.output,
        banner: banner
    },
    plugins: [
        // change browser: false to browser: true when buuilding for browser
        // in the future
        resolve({ extensions, browser: config.browser ?? false, preferBuiltins: true }),
        commonjs(),
        json(),
        babel({
            babelHelpers: "bundled",
            include: ["lib/**/*.ts"],
            extensions: extensions,
            exclude: ["node_modules/**", "test/**"],
            presets: [
                [
                    "@babel/preset-env",
                    {
                        targets: config.targets,
                        modules: "auto"
                    }
                ],
                "@babel/preset-typescript"
            ]
        }),
        minifyCode(),
        bundleSize(),
        (config.autoExternal ?? true) && autoExternal()
    ].concat(config.plugins ?? [])
});

const cjs = create({
    output: {
        file: packageJson.main,
        format: "cjs",
        exports: "named",
        generatedCode: {
            constBindings: true
        }
    },
    targets: "node > 14",
    browser: false
});

const esm = create({
    output: {
        file: packageJson.module,
        format: "esm",
        generatedCode: {
            constBindings: true
        },
        exports: "named",
        globals: {
            util: "util"
        }
    },
    external: ["util"],
    targets: target
});

const umd = create({
    output: {
        file: `dist/${name}.min.js`,
        format: "umd",
        name: "urbex",
        exports: "named",
        globals: {
            http: "http",
            https: "https",
            zlib: "zlib",
            util: "util"
        }
    },
    targets: target,
    external: ["http", "https", "zlib", "util"],
    autoExternal: false
});

export default [umd, cjs, esm];
