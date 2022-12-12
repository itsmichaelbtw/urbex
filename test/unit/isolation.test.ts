import chai from "chai";

import urbex from "../../lib/urbex";

import { environment } from "../../lib/environment";

describe("isolation", () => {
    it("should throw an error if endpoints are passed into the configuration", () => {
        chai.expect(() => {
            new urbex.Client({
                url: "/api"
            });
        }).to.throw();

        chai.expect(() => {
            urbex.isolateClient({
                url: "/api"
            });
        }).to.throw();
    });

    it("should start the internal cache clock", () => {
        const client = new urbex.Client({
            cache: {
                enabled: true,
                ttl: 5000
            }
        });

        chai.expect(client.cache.isRunning).to.be.true;

        client.cache.stop();
    });

    describe("constructor", () => {
        it("should create a new instance of UrbexClient", () => {
            chai.expect(new urbex.Client()).to.be.an.instanceOf(urbex.Client);
        });
    });

    describe("isolateClient()", () => {
        it("should create a new instance of UrbexClient", () => {
            const client = urbex.isolateClient({});

            client.configure({
                headers: {
                    "isolate-client": "true"
                }
            });

            chai.expect(client).to.be.an.instanceOf(urbex.Client);
            chai.expect(urbex.config.headers).to.not.have.property("isolate-client");
        });

        it("should create a new instance and accept a configuration object", () => {
            const client = new urbex.Client({
                url: "https://example.com:8080/api/v1",
                method: "POST",
                data: "Hello, world!"
            });

            chai.expect(client).to.be.an.instanceOf(urbex.Client);
            chai.expect(client.config.url.href).to.equal("https://example.com:8080/api/v1");
            chai.expect(client.config.url.hostname).to.equal("example.com");
            chai.expect(client.config.url.port).to.equal(8080);
            chai.expect(client.config.url.pathname).to.equal("/api/v1");
            chai.expect(client.config.method).to.equal("POST");
            chai.expect(client.config.data).to.equal("Hello, world!");
            chai.expect(client.config.pipelines.request).to.have.lengthOf(1);

            if (environment.isNode) {
                chai.expect(client.config.pipelines.response).to.have.lengthOf(2);
            } else {
                chai.expect(client.config.pipelines.response).to.have.lengthOf(1);
            }

            const client2 = urbex.isolateClient({
                method: "PATCH",
                data: "username=foo&password=bar"
            });

            chai.expect(client2).to.be.an.instanceOf(urbex.Client);
            chai.expect(client2.config.method).to.equal("PATCH");
            chai.expect(client2.config.data).to.equal("username=foo&password=bar");
        });
    });

    describe("isUrbexClient()", () => {
        it("should return true if the object is an instance of UrbexClient", () => {
            const client = urbex.isolateClient();
            chai.expect(urbex.isUrbexClient(client)).to.equal(true);
        });

        it("should return false if the object is not an instance of UrbexClient", () => {
            chai.expect(urbex.isUrbexClient({})).to.equal(false);
        });
    });

    describe("environment", () => {
        it("should return the current environment", () => {
            chai.expect(urbex.environment).to.equal(environment);
        });
    });
});
