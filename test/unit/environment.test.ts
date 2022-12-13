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

        chai.expect(environment.context).to.equal("browser");
        chai.expect(environment.isBrowser).to.equal(true);
        chai.expect(environment.isNode).to.equal(false);
    });

    it("should detect the environment context (node)", function () {
        if (environment.isBrowser) {
            this.skip();
        }

        chai.expect(environment.context).to.equal("node");
        chai.expect(environment.isNode).to.equal(true);
        chai.expect(environment.isBrowser).to.equal(false);
    });

    it("should return the Node process", function () {
        if (environment.isBrowser) {
            chai.expect(environment.process).to.deep.equal({});
        } else {
            chai.expect(environment.process).to.equal(process);
        }
    });

    it("current environment should be development", function () {
        if (environment.isBrowser) {
            this.skip();
        }

        chai.expect(environment.isDevelopment).to.equal(true);
        chai.expect(environment.isProduction).to.equal(false);
    });

    it("current environment should be production", function () {
        if (environment.isBrowser) {
            this.skip();
        }

        envAgent.set("NODE_ENV", "production");

        chai.expect(environment.isProduction).to.equal(true);
        chai.expect(environment.isDevelopment).to.equal(false);
    });

    it("should create the correct environment component (browser)", function () {
        if (environment.isNode) {
            this.skip();
        }

        const parser = environment.getEnvironmentComponent();

        chai.expect(parser).to.be.instanceOf(URLParser);

        const envComponent = parser.toJSON();

        chai.expect(envComponent.href).to.equal(window.location.href);
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

    it("should throw an error when attempting to use Node only operations (browser)", function () {
        if (environment.isNode) {
            this.skip();
        }

        chai.expect(() => environment.isDevelopment).to.throw();
        chai.expect(() => environment.isProduction).to.throw();
    });
});
