import chai from "chai";

import urbex from "../../lib/urbex";

import { environment } from "../../lib/environment";
import { stringReplacer } from "../../lib/utils";

const client = new urbex.Client();

describe("UrbexClient", () => {
    beforeEach(() => {
        client.reset();
    });

    it("should have http method alias", () => {
        chai.expect(urbex).to.have.property("get");
        chai.expect(urbex).to.have.property("post");
        chai.expect(urbex).to.have.property("put");
        chai.expect(urbex).to.have.property("patch");
        chai.expect(urbex).to.have.property("delete");
        chai.expect(urbex).to.have.property("head");
        chai.expect(urbex).to.have.property("options");
    });

    it("should return the current configuration of the client", () => {
        client.configure({
            method: "POST",
            url: "https://example.com",
            data: {
                foo: "bar"
            },
            responseType: "json",
            responseEncoding: "utf8"
        });

        const config = client.config;

        chai.expect(config.method).to.equal("POST");
        chai.expect(config.url.href).to.equal("https://example.com/");
        chai.expect(config.data).to.deep.equal({
            foo: "bar"
        });

        chai.expect(config.responseType).to.equal("json");
        chai.expect(config.responseEncoding).to.equal("utf8");
    });

    it("should reset the configuration to default values (browser)", function () {
        if (environment.isNode) {
            this.skip();
        }

        client.configure({
            method: "POST",
            url: "https://example.com",
            cache: {
                overwrite: true,
                resetTimeoutOnAccess: true,
                autoStart: false
            }
        });

        chai.expect(client.config.method).to.equal("POST");
        chai.expect(client.config.url.href).to.equal("https://example.com/");
        chai.expect(client.cache.options.overwrite).to.equal(true);

        client.reset();

        chai.expect(client.config.method).to.equal("GET");
        chai.expect(client.config.url.hostname).to.equal(window.location.hostname);
        chai.expect(client.config.url.protocol).to.equal(
            stringReplacer(window.location.protocol, /:/, "")
        );

        chai.expect(client.config.url.port).to.equal(Number(window.location.port));
    });

    it("should reset the configuration to default values (node)", function () {
        if (environment.isBrowser) {
            this.skip();
        }

        client.configure({
            method: "POST",
            url: "https://example.com",
            cache: {
                overwrite: true,
                resetTimeoutOnAccess: true,
                autoStart: false
            }
        });

        chai.expect(client.config.method).to.equal("POST");
        chai.expect(client.config.url.href).to.equal("https://example.com/");
        chai.expect(client.cache.options.overwrite).to.equal(true);

        client.reset();

        chai.expect(client.config.method).to.equal("GET");
        chai.expect(client.config.url.hostname).to.equal("localhost");
        chai.expect(client.config.url.protocol).to.equal("http");
        chai.expect(client.config.url.port).to.equal(3000);
    });

    describe("internal cache", () => {
        it("should return the current cache module", () => {
            client.configure({
                cache: {
                    overwrite: true,
                    resetTimeoutOnAccess: true,
                    autoStart: false
                }
            });

            const cache = client.cache.options;

            chai.expect(cache.overwrite).to.equal(true);
            chai.expect(cache.resetTimeoutOnAccess).to.equal(true);
            chai.expect(cache.autoStart).to.equal(false);
        });

        it("should enable the cache", () => {
            client.configure({
                cache: {
                    autoStart: true,
                    enabled: true
                }
            });

            chai.expect(client.cache.isRunning).to.equal(true);
            chai.expect(client.cache.options.autoStart).to.equal(true);
            chai.expect(client.config.cache.enabled).to.equal(true);

            client.cache.stop();
        });

        it("should disable the cache", () => {
            client.configure({
                cache: {
                    enabled: true
                }
            });

            chai.expect(client.cache.isRunning).to.equal(true);
            chai.expect(client.cache.options.autoStart).to.equal(true);

            client.configure({
                cache: {
                    enabled: false
                }
            });

            chai.expect(client.cache.isRunning).to.equal(false);
            chai.expect(client.config.cache.enabled).to.equal(false);
        });
    });

    describe("isolated clients", () => {
        it("should create a new instance and accept a configuration object", () => {
            const client = new urbex.Client({
                method: "POST",
                data: "Hello, world!"
            });

            chai.expect(client).to.be.an.instanceOf(urbex.Client);
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
    });

    describe(".configure()", () => {
        it("should configure the UrbexClient", () => {
            urbex.configure({
                url: "https://example.com"
            });

            chai.expect(urbex.config.url.href).to.equal("https://example.com/");
        });

        it("should merge configurations together", () => {
            urbex.configure({
                url: "https://example.com",
                resolveStatus: () => {
                    return true;
                }
            });

            urbex.configure({
                url: "https://example.org",
                timeout: 1000
            });

            chai.expect(urbex.config.url.href).to.equal("https://example.org/");
            chai.expect(urbex.config.resolveStatus).to.be.a("function");
            chai.expect(urbex.config.timeout).to.equal(1000);
        });
    });
});

describe("ExtendedUrbexClient", () => {
    describe(".isolateClient()", () => {
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
    });

    describe(".isUrbexClient()", () => {
        it("should return true if the object is an instance of UrbexClient", () => {
            const client = urbex.isolateClient();
            chai.expect(urbex.isUrbexClient(client)).to.equal(true);
        });

        it("should return false if the object is not an instance of UrbexClient", () => {
            chai.expect(urbex.isUrbexClient({})).to.equal(false);
        });
    });

    describe(".environment", () => {
        it("should return the current environment", () => {
            chai.expect(urbex.environment).to.equal(environment);
        });
    });
});
