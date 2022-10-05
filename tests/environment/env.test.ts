import fs from "fs";

import { beforeAll, afterAll, describe, expect, test } from "@jest/globals";
import { env } from "../../lib/environment";
import { DOTENV_FILENAME } from "../../lib/constants";
import { hasOwnProperty } from "../../lib/utils";

describe("env", () => {
    beforeAll(() => {
        const environmentVariables = `
        URBEX=1
        PORT=1234
        AUTHOR="Orison Networks"
        UNIT_TEST=true
        # here is a comment
        COMMENT=passed
    `;

        fs.writeFileSync(DOTENV_FILENAME, environmentVariables);
    });

    afterAll(() => {
        fs.unlinkSync(DOTENV_FILENAME);
    });

    test("should parse the environment variables", () => {
        const environmentVariables = env.configure();

        expect(environmentVariables).toEqual({
            URBEX: "1",
            PORT: "1234",
            AUTHOR: "Orison Networks",
            UNIT_TEST: "true",
            COMMENT: "passed"
        });
    });

    test("should be accessible on process.env", () => {
        const environmentVariables = env.configure();

        for (const key of Object.keys(environmentVariables)) {
            expect(hasOwnProperty(process.env, key)).toBe(true);
        }
    });

    test("should get the environment variable", () => {
        const environmentVariable = env.get("PORT");

        expect(environmentVariable).toBe("1234");
    });

    test("should set the environment variable", () => {
        env.set("TEST", "1234");

        expect(env.get("TEST")).toBe("1234");
    });
});
