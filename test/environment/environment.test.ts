import chai from "chai";

import { Environment, env } from "../../lib/environment";

const environment = new Environment();

describe("new Environment", () => {
    before(() => {
        env.set("NODE_ENV", "development");
    });

    it("should detect the environment context", () => {
        if (environment.isNode) {
            chai.assert.strictEqual(environment.context, "node");
            chai.assert.strictEqual(environment.isBrowser, false);
        }

        if (environment.isBrowser) {
            chai.assert.strictEqual(environment.context, "browser");
            chai.assert.strictEqual(environment.isNode, false);
        }
    });

    it("current environment should be development", () => {
        chai.assert.isTrue(environment.isDevelopment);
        chai.assert.isFalse(environment.isProduction);
    });

    it("current environment should be production", () => {
        env.set("NODE_ENV", "production");

        chai.assert.isTrue(environment.isProduction);
        chai.assert.isFalse(environment.isDevelopment);
    });
});
