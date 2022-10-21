import chai from "chai";

import type { BaseURIComponent } from "../../lib/core/types";

import {
    serializeParams,
    uriParser,
    convertURIComponentToString,
    convertStringToURIComponent
} from "../../lib/core/url";

describe("core/url", () => {
    describe("uriParser", () => {
        describe("params", () => {
            it("should serialize any params", () => {
                const params = {
                    foo: "bar",
                    bar: "foo"
                };

                const result = uriParser("http://localhost", params);

                chai.assert.equal(result.params, "?foo=bar&bar=foo");
            });

            it("should return an empty string if no params are passed", () => {
                const result = uriParser("http://localhost");

                chai.assert.equal(result.params, "");
            });
        });

        it("should parse a URL (string)", () => {
            const uri = "https://example.com/foo/bar?foo=bar&bar=foo";

            const result = uriParser(uri);

            chai.assert.equal(result.protocol, "https");
            chai.assert.equal(result.hostname, "example.com");
            chai.assert.equal(result.port, "");
            chai.assert.equal(result.urlMount, "");
            chai.assert.equal(result.endpoint, "/foo/bar");
            chai.assert.equal(result.params, "?foo=bar&bar=foo");
        });

        it("should return an endpoint if a url path is detected", () => {
            const uri = "/foo/bar";

            const result = uriParser(uri);

            chai.assert.equal(result.endpoint, "/foo/bar");
        });

        it("should throw an error if endpoints are not allowed", () => {
            const uri = "/foo/bar";

            chai.assert.throws(() => uriParser(uri, null, false));
        });

        it("should parse a URI (object)", () => {
            const uri: BaseURIComponent = {
                protocol: "https",
                hostname: "example.com",
                port: 8080,
                urlMount: "/api",
                endpoint: "/foo/bar"
            };

            const params = {
                foo: "bar",
                bar: "foo"
            };

            const result = uriParser(uri, params);

            chai.assert.isObject(result);

            chai.assert.equal(result.protocol, "https");
            chai.assert.equal(result.hostname, "example.com");
            chai.assert.equal(result.port, 8080);
            chai.assert.equal(result.urlMount, "/api");
            chai.assert.equal(result.endpoint, "/foo/bar");
            chai.assert.equal(result.params, "?foo=bar&bar=foo");
        });

        it("should throw an error if an invalid URI is provided", () => {
            const number = 123;
            const array = [1, 2, 3];
            const object = { foo: "bar" };
            const boolean = true;

            // @ts-ignore
            chai.assert.throws(() => uriParser(number));
            // @ts-ignore
            chai.assert.throws(() => uriParser(array));
            // @ts-ignore
            chai.assert.throws(() => uriParser(object));
            // @ts-ignore
            chai.assert.throws(() => uriParser(boolean));
        });
    });

    describe("serializeParams", () => {
        it("should serialize params as an object", () => {
            const params = {
                foo: "bar",
                bar: "foo"
            };

            const result = serializeParams(params);

            chai.assert.equal(result, "foo=bar&bar=foo");
        });

        it("should serialize params as a string", () => {
            const params = "foo=bar&bar=foo";

            const result = serializeParams(params);

            chai.assert.equal(result, "foo=bar&bar=foo");
        });

        it("should serialize params as a URLSearchParams object", () => {
            const params = new URLSearchParams("foo=bar&bar=foo");

            const result = serializeParams(params);

            chai.assert.equal(result, "foo=bar&bar=foo");
        });

        it("should return null if no params are passed", () => {
            // @ts-ignore
            const result = serializeParams();

            chai.assert.equal(result, null);
        });

        it("should return null if an invalid input is passed", () => {
            // @ts-ignore
            const resultArray = serializeParams([]);
            // @ts-ignore
            const resultFunction = serializeParams(() => {});

            chai.assert.equal(resultArray, "");
            chai.assert.equal(resultFunction, "");
        });
    });

    describe("convertURIComponentToString", () => {
        it("should convert a URI component to a string", () => {
            const one = {
                protocol: "https",
                hostname: "example.com",
                port: 8080,
                urlMount: "/api",
                endpoint: "/foo/bar",
                params: "foo=bar&bar=foo"
            };

            const two = {
                protocol: "http",
                hostname: "example.com",
                port: null,
                urlMount: null,
                endpoint: "/foo/bar",
                params: null
            };

            const three = {
                protocol: "https",
                hostname: "example.com",
                port: 3000,
                urlMount: null,
                endpoint: null,
                params: "foo=bar&bar=foo"
            };

            const four = {
                protocol: "https",
                hostname: "example.com",
                port: null,
                urlMount: "/api",
                endpoint: "/foo/bar",
                params: null
            };

            const resultOne = convertURIComponentToString(one);
            const resultTwo = convertURIComponentToString(two);
            const resultThree = convertURIComponentToString(three);
            const resultFour = convertURIComponentToString(four);

            // prettier-ignore
            chai.assert.equal(resultOne, "https://example.com:8080/api/foo/bar?foo=bar&bar=foo");
            chai.assert.equal(resultTwo, "http://example.com/foo/bar");
            // prettier-ignore
            chai.assert.equal(resultThree, "https://example.com:3000?foo=bar&bar=foo");
            chai.assert.equal(resultFour, "https://example.com/api/foo/bar");
        });

        it("should return an empty string if an invalid component is passed", () => {
            // @ts-ignore
            const array = convertURIComponentToString([]);
            // @ts-ignore
            const functionResult = convertURIComponentToString(() => {});
            // @ts-ignore
            const number = convertURIComponentToString(123);

            chai.assert.equal(array, "");
            chai.assert.equal(functionResult, "");
            chai.assert.equal(number, "");
        });
    });

    describe("convertStringToURIComponent", () => {
        it("should convert a string to a URI component", () => {
            const one = "https://example.com:8080/api/foo/bar?foo=bar&bar=foo";
            const two = "http://example.com/foo/bar";
            const three = "https://example.com:3000?foo=bar&bar=foo";
            const four = "https://example.com/api/foo/bar";

            const resultOne = convertStringToURIComponent(one, "/api");
            const resultTwo = convertStringToURIComponent(two);
            const resultThree = convertStringToURIComponent(three);
            const resultFour = convertStringToURIComponent(four, "/api");

            chai.assert.equal(resultOne.protocol, "https");
            chai.assert.equal(resultOne.hostname, "example.com");
            chai.assert.equal(resultOne.port, 8080);
            chai.assert.equal(resultOne.urlMount, "/api");
            chai.assert.equal(resultOne.endpoint, "/foo/bar");
            chai.assert.equal(resultOne.params, "?foo=bar&bar=foo");

            chai.assert.equal(resultTwo.protocol, "http");
            chai.assert.equal(resultTwo.hostname, "example.com");
            chai.assert.equal(resultTwo.port, "");
            chai.assert.equal(resultTwo.urlMount, "");
            chai.assert.equal(resultTwo.endpoint, "/foo/bar");
            chai.assert.equal(resultTwo.params, "");

            chai.assert.equal(resultThree.protocol, "https");
            chai.assert.equal(resultThree.hostname, "example.com");
            chai.assert.equal(resultThree.port, 3000);
            chai.assert.equal(resultThree.urlMount, "");
            chai.assert.equal(resultThree.endpoint, "/");
            chai.assert.equal(resultThree.params, "?foo=bar&bar=foo");

            chai.assert.equal(resultFour.protocol, "https");
            chai.assert.equal(resultFour.hostname, "example.com");
            chai.assert.equal(resultFour.port, "");
            chai.assert.equal(resultFour.urlMount, "/api");
            chai.assert.equal(resultFour.endpoint, "/foo/bar");
            chai.assert.equal(resultFour.params, "");
        });

        it("should throw an error if an invalid string is passed", () => {
            // @ts-ignore
            chai.assert.throws(() => convertStringToURIComponent([]));
            // @ts-ignore
            chai.assert.throws(() => convertStringToURIComponent(() => {}));
            // @ts-ignore
            chai.assert.throws(() => convertStringToURIComponent(123));
        });
    });
});
