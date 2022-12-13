import chai from "chai";

import type { Headers } from "../../lib/types";

import { UrbexHeaders } from "../../lib/core/headers";
import { environment } from "../../lib/environment";
import { forEach } from "../../lib/utils";

const headers = new UrbexHeaders();

function checkHeaders(headers: Headers, key: string, value: string) {
    forEach(headers, (headerKey, headerValue) => {
        if (headerKey.toLowerCase() === key) {
            chai.assert.equal(headerValue, value);
        }
    });
}

describe("headers", () => {
    beforeEach(() => {
        headers.clear();
    });

    it("default headers should be set (browser)", function () {
        if (environment.isNode) {
            this.skip();
        }

        const headersObj = headers.get();

        chai.expect(headersObj).to.have.property("Content-Type");
        chai.expect(Object.keys(headersObj)).to.have.lengthOf(1);
    });

    it("default headers should be set (node)", function () {
        if (environment.isBrowser) {
            this.skip();
        }

        const headersObj = headers.get();

        chai.expect(headersObj).to.have.property("Content-Type");
        chai.expect(headersObj).to.have.property("User-Agent");
        chai.expect(Object.keys(headersObj)).to.have.lengthOf(2);
    });

    describe("parse() (static)", () => {
        it("should parse a header string into an object", () => {
            const string = "X-Foo: bar";

            const result = UrbexHeaders.parse(string);

            chai.expect(result).to.deep.equal({
                "X-Foo": "bar"
            });
        });

        it("should parse a header string into an object (with multiple values)", () => {
            const string = "X-Foo: bar\r X-Bar: foo\r X-Baz: FOO\r X-Baz: BAR";

            const result = UrbexHeaders.parse(string);

            chai.expect(result).to.deep.equal({
                "X-Foo": "bar",
                "X-Bar": "foo",
                "X-Baz": "BAR"
            });
        });

        it("should normalize header keys and values", () => {
            const string = "x-foo: bar\r x-bar: foo\r x-baz: FOO\r x-baz: BAR";

            const result = UrbexHeaders.parse(string);

            chai.expect(result).to.deep.equal({
                "X-Foo": "bar",
                "X-Bar": "foo",
                "X-Baz": "BAR"
            });
        });

        it("should return an empty object if no headers are passed", () => {
            // @ts-expect-error
            const result = UrbexHeaders.parse();

            chai.expect(result).to.deep.equal({});
        });
    });

    describe("defaults", () => {
        it("should return the default headers (browser)", function () {
            if (environment.isNode) {
                this.skip();
            }

            const result = headers.defaults;

            chai.expect(result).to.have.property("Content-Type");
            chai.expect(Object.keys(result)).to.have.lengthOf(1);
        });

        it("should return the default headers (node)", function () {
            if (environment.isBrowser) {
                this.skip();
            }

            const result = headers.defaults;

            chai.expect(result).to.have.property("Content-Type");
            chai.expect(result).to.have.property("User-Agent");
            chai.expect(Object.keys(result)).to.have.lengthOf(2);
        });
    });

    describe("set()", () => {
        it("should be able to set headers", () => {
            const object = {
                "x-foo": "bar",
                "x-bar": "foo"
            };

            headers.set(object);

            const result = headers.get();

            checkHeaders(result, "x-foo", "bar");
            checkHeaders(result, "x-bar", "foo");
        });

        it("should not merge with existing headers", () => {
            headers.set(headers.defaults);

            const object = {
                "x-foo": "bar",
                "x-bar": "foo"
            };

            headers.set(object, false);

            const result = headers.get();

            checkHeaders(result, "x-foo", "bar");
            checkHeaders(result, "x-bar", "foo");
            chai.expect(Object.keys(result)).to.have.lengthOf(2);
        });

        it("should normalize header keys and values", () => {
            const object = {
                "x-foo": "bar",
                "x-bar": "foo",
                "x-baz": "FOO"
            };

            headers.set(object, false);

            const result = headers.get();

            chai.expect(result).to.deep.equal({
                "X-Foo": "bar",
                "X-Bar": "foo",
                "X-Baz": "FOO"
            });
        });

        it("should not set undefined headers", () => {
            const object = {
                "x-foo": "bar",
                "x-bar": undefined
            };

            headers.set(object, false);

            const result = headers.get();

            chai.expect(result).to.deep.equal({
                "X-Foo": "bar"
            });

            chai.expect(Object.keys(result)).to.have.lengthOf(1);
        });

        it("should return the original input if headers are not a valid object", () => {
            // @ts-expect-error
            const result = headers.set(123);

            chai.expect(result).to.equal(123);
        });
    });

    describe("get()", () => {
        it("should return the headers", () => {
            const object = {
                "x-foo": "bar",
                "x-bar": "foo"
            };

            headers.set(object);

            const result = headers.get();

            checkHeaders(result, "x-foo", "bar");
            checkHeaders(result, "x-bar", "foo");
        });
    });

    describe("has()", () => {
        it("should return true if the header exists", () => {
            const object = {
                "x-foo": "bar",
                "x-bar": "foo"
            };

            headers.set(object);

            const result = headers.has("x-foo");

            chai.expect(result).to.be.true;
        });

        it("should return false if the header does not exist", () => {
            const object = {
                "x-foo": "bar",
                "x-bar": "foo"
            };

            headers.set(object);

            const result = headers.has("x-baz");

            chai.expect(result).to.be.false;
        });
    });

    describe("delete()", () => {
        it("should delete a header", () => {
            const object = {
                "x-foo": "bar",
                "x-bar": "foo"
            };

            headers.set(object);

            headers.delete("x-foo");

            const result = headers.get();

            chai.expect(result).to.not.have.property("x-foo");
            checkHeaders(result, "x-bar", "foo");
        });
    });

    describe("clear()", () => {
        it("should clear user defined headers", () => {
            const object = {
                "x-foo": "bar",
                "x-bar": "foo"
            };

            headers.set(object);

            headers.clear();

            const result = headers.get();

            chai.expect(result).to.deep.equal(headers.defaults);
        });

        it("should remove all headers (including defaults)", () => {
            headers.clear(true);

            const result = headers.get();

            chai.expect(result).to.deep.equal({});
        });
    });

    describe("normalize()", () => {
        it("should normalize a header object", () => {
            const object = {
                "x-foo": "bar",
                "x-bar": "foo",
                "x-baz": "FOO"
            };

            const result = headers.normalize(object);

            chai.expect(result).to.deep.equal({
                "X-Foo": "bar",
                "X-Bar": "foo",
                "X-Baz": "FOO"
            });
        });

        it("should return an empty object", () => {
            // @ts-expect-error
            const result = headers.normalize(123);

            chai.expect(result).to.deep.equal({});
        });
    });
});
