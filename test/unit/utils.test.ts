import chai from "chai";

import { clone, deepMerge, forEach, hasOwnProperty, isEmpty, merge } from "../../lib/utils";

describe("utils", () => {
    describe("clone", () => {
        it("should clone an object", () => {
            const object = {
                foo: "bar"
            };

            const result = clone(object);

            chai.assert.equal(result.foo, "bar");
        });

        it("should clone an array", () => {
            const array = ["foo", "bar"];

            const result = clone(array);

            chai.assert.equal(result[0], "foo");
            chai.assert.equal(result[1], "bar");
        });

        it("should clone any value", () => {
            const string = "foo";
            const number = 1000;
            const boolean = true;

            const resultString = clone(string);
            const resultNumber = clone(number);
            const resultBoolean = clone(boolean);

            chai.assert.equal(resultString, "foo");
            chai.assert.equal(resultNumber, 1000);
            chai.assert.equal(resultBoolean, true);
        });
    });

    describe("shallow merge", () => {
        it("should merge two objects", () => {
            const object1 = {
                foo: "bar"
            };

            const object2 = {
                bar: "foo"
            };

            const result = merge(object1, object2);

            chai.assert.equal(result.foo, "bar");
            chai.assert.equal(result.bar, "foo");
        });
    });

    describe("deepMerge", () => {
        it("should merge two objects", () => {
            const object1 = {
                foo: "bar"
            };

            const object2 = {
                bar: "foo"
            };

            const result = deepMerge(object1, object2);

            chai.assert.equal(result.foo, "bar");
            chai.assert.equal(result.bar, "foo");
        });

        it("should merge two objects with the same key and different value", () => {
            const object1 = {
                foo: "bar"
            };

            const object2 = {
                foo: "foo"
            };

            const result = deepMerge(object1, object2);

            chai.assert.equal(result.foo, "foo");
        });

        it("should merge nested objects", () => {
            const object1 = {
                foo: {
                    bar: "bar"
                },
                bar: "bar",
                baz: {
                    hey: {
                        hello: "world"
                    }
                }
            };

            const object2 = {
                foo: {
                    bar: "foo"
                },
                bar: "foo"
            };

            const result = deepMerge(object1, object2);

            chai.assert.equal(result.foo.bar, "foo");
        });
    });

    describe("forEach", () => {
        it("should iterate over an object", () => {
            const object = {
                foo: "bar",
                bar: "foo"
            };

            let result = "";

            forEach(object, (key, value) => {
                result += `${key}:${value}`;
            });

            chai.assert.equal(result, "foo:barbar:foo");
        });

        it("should iterate over an array", () => {
            const array = ["foo", "bar"];

            let result = "";

            forEach(array, (index, value) => {
                result += `${String(index)}:${value}`;
            });

            chai.assert.equal(result, "0:foo1:bar");
        });
    });

    describe("hasOwnProperty", () => {
        it("should return true if an object has a property", () => {
            const object = {
                foo: "bar"
            };

            const result = hasOwnProperty(object, "foo");

            chai.assert.equal(result, true);
        });

        it("should return false if an object does not have a property", () => {
            const object = {
                foo: "bar"
            };

            const result = hasOwnProperty(object, "bar");

            chai.assert.equal(result, false);
        });
    });

    describe("isEmpty", () => {
        it("should return true if an object is empty", () => {
            const object = {};

            const result = isEmpty(object);

            chai.assert.equal(result, true);
        });

        it("should return false if an object is not empty", () => {
            const object = {
                foo: "bar"
            };

            const result = isEmpty(object);

            chai.assert.equal(result, false);
        });

        it("should return true if an array is empty", () => {
            const array = [];

            const result = isEmpty(array);

            chai.assert.equal(result, true);
        });

        it("should return false if an array is not empty", () => {
            const array = ["foo", "bar"];

            const result = isEmpty(array);

            chai.assert.equal(result, false);
        });

        it("should return true if a string is empty", () => {
            const string = "";

            const result = isEmpty(string);

            chai.assert.equal(result, true);
        });
    });
});
