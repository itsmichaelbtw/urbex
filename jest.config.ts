import type { Config } from "jest";

const Config: Config = {
    transform: {
        "^.+\\.ts?$": "ts-jest"
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    modulePaths: ["<rootDir>/lib", "<rootDir>/node_modules"]
};

export default Config;
