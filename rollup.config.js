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

export default [
    {
        input: "lib/urbex.ts",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: true,
                exports: "named",
                generatedCode: {
                    constBindings: true
                },
                banner: banner
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: true,
                exports: "named",
                banner: banner
            },
            {
                file: `dist/${name}.js`,
                format: "umd",
                exports: "named",
                name: "urbex",
                globals: {
                    http: "http",
                    https: "https",
                    url: "url",
                    fs: "fs",
                    path: "path",
                    os: "os"
                },
                banner: banner
            }
        ],
        plugins: [
            resolve({ extensions }),
            json(),
            commonjs(),
            babel({
                babelHelpers: "bundled",
                include: ["lib/**/*.ts"],
                extensions: extensions,
                exclude: "node_modules/**",
                presets: ["@babel/preset-typescript", "@babel/preset-env"]
            }),
            minifyCode(),
            bundleSize()
        ],
        external: ["http", "https", "url"]
    }
];
