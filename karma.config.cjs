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
            [testGlob]: ["karma-typescript"]
        },
        reporters: ["progress", "karma-typescript"],
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
