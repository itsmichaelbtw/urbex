import chai from "chai";
import envAgent from "env-agent";

import { Environment } from "../../lib/environment";
import { URLParser } from "../../lib/core/parsers/url-parser";

const environment = new Environment();

envAgent.options.overwrite = true;

describe("environment", () => {
    before(() => {
        envAgent.set("NODE_ENV", "development");
    });

    it("should create a new environment instance", () => {
        const env = new Environment();

        chai.assert.instanceOf(env, Environment);
    });

    it("should detect the environment context (browser)", function () {
        if (environment.isNode) {
            this.skip();
        }

        chai.assert.strictEqual(environment.context, "browser");
        chai.assert.strictEqual(environment.isBrowser, true);
        chai.assert.strictEqual(environment.isNode, false);
    });

    it("should detect the environment context (node)", function () {
        if (environment.isBrowser) {
            this.skip();
        }

        chai.assert.strictEqual(environment.context, "node");
        chai.assert.strictEqual(environment.isNode, true);
        chai.assert.strictEqual(environment.isBrowser, false);
    });

    it("current environment should be development", function () {
        if (environment.isBrowser) {
            this.skip();
        }

        chai.assert.isTrue(environment.isDevelopment);
        chai.assert.isFalse(environment.isProduction);
    });

    it("current environment should be production", function () {
        if (environment.isBrowser) {
            this.skip();
        }

        envAgent.set("NODE_ENV", "production");

        chai.assert.isTrue(environment.isProduction);
        chai.assert.isFalse(environment.isDevelopment);
    });

    it("should create the correct environment component (browser)", function () {
        if (environment.isNode) {
            this.skip();
        }
    });

    it("should create the correct environment component (node)", function () {
        if (environment.isBrowser) {
            this.skip();
        }

        const parser = environment.getEnvironmentComponent();

        chai.assert.instanceOf(parser, URLParser);

        const envComponent = parser.toJSON();

        chai.expect(envComponent).to.have.property("protocol");
        chai.expect(envComponent).to.have.property("hostname");
        chai.expect(envComponent).to.have.property("port");
        chai.expect(envComponent.protocol).to.equal("http");
        chai.expect(envComponent.hostname).to.equal("localhost");
        chai.expect(envComponent.port).to.equal(3000);
    });
});
