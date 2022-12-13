const testGlob = "test/**/*.test.ts";
const libGlobal = "lib/**/*.ts";

module.exports = (config) => {
    config.set({
        basePath: ".",
        frameworks: ["mocha", "chai", "karma-typescript"],
        files: [
            {
                pattern: libGlobal
            },
            {
                pattern: testGlob
            },
            {
                pattern: "test/constants.ts"
            }
        ],
        plugins: [
            require("karma-mocha"),
            require("karma-chai"),
            require("karma-typescript"),
            require("karma-chrome-launcher")
            // require("karma-firefox-launcher") for some god forsaken reason this fails when running in github actions
        ],
        preprocessors: {
            [libGlobal]: ["karma-typescript"],
            [testGlob]: ["karma-typescript"],
            "test/constants.ts": ["karma-typescript"]
        },
        exclude: [
            "test/unit/isolation.test.ts",
            "test/unit/url-parser.test.ts",
            "test/unit/utils.test.ts"
        ],
        browsers: ["ChromeHeadless" /*"FirefoxHeadless"*/],
        port: 9876,
        captureTimeout: 4 * 60 * 1000,
        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 1,
        browserNoActivityTimeout: 4 * 60 * 1000,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        // @ts-ignore
        karmaTypescriptConfig: {
            compilerOptions: {
                lib: ["ES2015", "DOM", "DOM.Iterable"],
                esModuleInterop: true,
                module: "commonjs",
                target: "ES2015",
                skipLibCheck: true
            },
            bundlerOptions: {
                transforms: [require("karma-typescript-es6-transform")()]
            },
            include: [testGlob, libGlobal]
        }
    });
};
