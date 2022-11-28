import chai from "chai";

import { environment } from "../../lib/environment";
import urbex from "../../lib/urbex";

describe("urbex", () => {
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

    it("should have http methods", () => {
        chai.expect(urbex).to.have.property("get");
        chai.expect(urbex).to.have.property("post");
        chai.expect(urbex).to.have.property("put");
        chai.expect(urbex).to.have.property("patch");
        chai.expect(urbex).to.have.property("delete");
        chai.expect(urbex).to.have.property("head");
        chai.expect(urbex).to.have.property("options");
    });
});
