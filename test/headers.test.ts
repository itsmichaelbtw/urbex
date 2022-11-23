import chai from "chai";

import type { Headers } from "../lib/types";

import { UrbexHeaders } from "../lib/core/headers";
import { environment } from "../lib/environment";
import { forEach } from "../lib/utils";

const headers = new UrbexHeaders();

function checkHeaders(headers: Headers, key: string, value: string) {
    forEach(headers, (headerKey, headerValue) => {
        if (headerKey.toLowerCase() === key) {
            chai.assert.equal(headerValue, value);
        }
    });
}

describe("UrbexHeaders", () => {
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

    it("should be able to delete a header", () => {
        const object = {
            "x-foo": "bar",
            "x-bar": "foo"
        };

        headers.set(object);
        headers.delete("x-foo");

        const result = headers.get();

        chai.expect(result).to.not.have.property("x-foo");
    });

    it("should clear headers", () => {
        const object = {
            "x-foo": "bar",
            "x-bar": "foo"
        };

        headers.set(object);

        headers.clear();

        const result = headers.get();

        chai.expect(result).to.deep.equal(headers.defaults);
    });

    it("should clear headers with no defaults", () => {
        const object = {
            "x-foo": "bar",
            "x-bar": "foo"
        };

        headers.set(object);

        headers.clear(true);

        const result = headers.get();

        chai.expect(result).to.deep.equal({});
    });

    it("should create a safe header object (normalized)", () => {
        const object = {
            "X-FoO": "bar",
            "x-bar": "foo",
            "x-BAZ": "FOO"
        };

        const result = headers.normalize(object);

        chai.expect(result).to.deep.equal({
            "X-Foo": "bar",
            "X-Bar": "foo",
            "X-Baz": "FOO"
        });
    });

    it("should parse a header string into an object", () => {
        const string = "X-Foo: bar\r X-Bar: foo\r X-Baz: FOO";

        const result = UrbexHeaders.parse(string);

        chai.expect(result).to.deep.equal({
            "X-Foo": "bar",
            "X-Bar": "foo",
            "X-Baz": "FOO"
        });
    });
});
