import chai from "chai";

import { Environment, env } from "../../lib/environment";

const environment = new Environment();

describe("new Environment", () => {
    before(() => {
        env.set("NODE_ENV", "development");
    });

    it("should detect the environment context (browser)", function () {
        if (environment.isNode) {
            this.skip();
            return;
        }

        chai.assert.strictEqual(environment.context, "browser");
        chai.assert.strictEqual(environment.isBrowser, true);
        chai.assert.strictEqual(environment.isNode, false);
    });

    it("should detect the environment context (node)", function () {
        if (environment.isBrowser) {
            this.skip();
            return;
        }

        chai.assert.strictEqual(environment.context, "node");
        chai.assert.strictEqual(environment.isNode, true);
        chai.assert.strictEqual(environment.isBrowser, false);
    });

    it("current environment should be development", function () {
        if (environment.isBrowser) {
            this.skip();
            return;
        }

        chai.assert.isTrue(environment.isDevelopment);
        chai.assert.isFalse(environment.isProduction);
    });

    it("current environment should be production", function () {
        if (environment.isBrowser) {
            this.skip();
            return;
        }

        env.set("NODE_ENV", "production");

        chai.assert.isTrue(environment.isProduction);
        chai.assert.isFalse(environment.isDevelopment);
    });
});
