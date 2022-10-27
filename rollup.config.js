import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import bundleSize from "rollup-plugin-bundle-size";

import packageJson from "./package.json";

import { minify } from "terser";

const extensions = [".ts"];
const name = packageJson.name;
const banner = `/**
    * ${packageJson.name} v${packageJson.version}
    * ${packageJson.homepage}
    * (c) ${new Date().getFullYear()} ${packageJson.author}
    * @license ${packageJson.license}
    */
`;

const input = "lib/urbex.ts";
const target = "last 3 years";

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
        banner: banner,
        sourcemap: true
    },
    plugins: [
        resolve({ extensions, browser: config.browser ?? false }),
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
                        modules: false,
                        loose: true
                    }
                ],
                "@babel/preset-typescript"
            ]
        }),
        minifyCode(),
        bundleSize()
    ].concat(config.plugins ?? [])
});

const cjs = create({
    output: {
        file: packageJson.main,
        format: "cjs",
        exports: "default",
        generatedCode: {
            constBindings: true
        }
    },
    targets: "node > 16"
});

const esm = create({
    output: {
        file: packageJson.module,
        format: "esm",
        generatedCode: {
            constBindings: true
        },
        exports: "named"
    },
    targets: target
});

const umd = create({
    output: {
        file: `dist/${name}.min.js`,
        format: "umd",
        name: "urbex",
        exports: "default",
        globals: {
            fs: "fs",
            path: "path",
            os: "os",
            http: "http",
            https: "https"
        }
    },
    targets: target
});

export default [cjs, esm, umd];
