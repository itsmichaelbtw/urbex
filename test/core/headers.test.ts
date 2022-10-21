import chai from "chai";

import { UrbexHeaders, BaseUrbexHeaders } from "../../lib/core/headers";
import { forEach } from "../../lib/utils";

const headers = new UrbexHeaders();

function checkHeaders(headers: BaseUrbexHeaders, key: string, value: string) {
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

    it("should default if no headers are set", () => {
        const result = headers.get();

        chai.expect(result).to.deep.equal(headers.defaults);
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
});
