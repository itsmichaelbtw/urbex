import chai from "chai";

import urbex from "../../lib/urbex";

import { environment } from "../../lib/environment";
import { stringReplacer } from "../../lib/utils";
import { SERVER_URL } from "../constants";

const client = new urbex.Client();

describe("urbex", () => {
    beforeEach(() => {
        client.reset();
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
        chai.expect(config.url.href).to.equal("https://example.com");
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
        chai.expect(client.config.url.href).to.equal("https://example.com");
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
        chai.expect(client.config.url.href).to.equal("https://example.com");
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

        it("should be separate for each client instance", () => {
            const client2 = new urbex.Client();

            client2.configure({
                cache: {
                    enabled: true
                }
            });

            client2.cache.set("foo", "bar");

            chai.expect(client.cache.get("foo")).to.equal(undefined);
            chai.expect(client2.cache.get("foo").v).to.equal("bar");
            chai.expect(client.cache.isRunning).to.equal(false);
            chai.expect(client2.cache.isRunning).to.equal(true);

            client2.cache.stop();
        });
    });

    describe("configure()", () => {
        it("should configure the UrbexClient", () => {
            urbex.configure({
                url: "https://example.com"
            });

            chai.expect(urbex.config.url.href).to.equal("https://example.com");
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

            chai.expect(urbex.config.url.href).to.equal("https://example.org");
            chai.expect(urbex.config.resolveStatus).to.be.a("function");
            chai.expect(urbex.config.timeout).to.equal(1000);
        });
    });
});
