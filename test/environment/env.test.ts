import fs from "fs";
import chai from "chai";

import { env, Environment } from "../../lib/environment";
import { DOTENV_FILENAME } from "../../lib/constants";
import { hasOwnProperty } from "../../lib/utils";

const environment = new Environment();

describe("env", () => {
    if (environment.isNode) {
        before(() => {
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

        after(() => {
            fs.unlinkSync(DOTENV_FILENAME);
        });

        it("should parse the environment variables", () => {
            const environmentVariables = env.configure();

            chai.expect(environmentVariables).to.deep.equal({
                URBEX: "1",
                PORT: "1234",
                AUTHOR: "Orison Networks",
                UNIT_TEST: "true",
                COMMENT: "passed"
            });
        });

        it("should be accessible on process.env", () => {
            const environmentVariables = env.configure();

            for (const key of Object.keys(environmentVariables)) {
                chai.expect(hasOwnProperty(process.env, key)).to.be.true;
            }
        });

        it("should get the environment variable", () => {
            const environmentVariable = env.get("PORT");

            chai.expect(environmentVariable).to.equal("1234");
        });

        it("should set the environment variable", () => {
            env.set("TEST", "1234");

            chai.expect(env.get("TEST")).to.equal("1234");
        });
    } else {
        it("should be skipped (browser)", () => {
            chai.assert.isTrue(true);
        });
    }
});
