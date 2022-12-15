// test the transformers

import chai from "chai";

import stream from "stream";

import { SERVER_URL } from "../constants";

import urbex, { URLParser } from "../../lib/urbex";
import { UrbexHeaders } from "../../lib/core/headers";
import {
    transformResponseData,
    transformRequestData,
    decodeResponseData
} from "../../lib/core/transformers";
import { DEFAULT_CLIENT_OPTIONS, DEFAULT_URBEX_RESPONSE } from "../../lib/core/constants";
import { deepClone, merge } from "../../lib/utils";

const defaults = deepClone(DEFAULT_CLIENT_OPTIONS);
const response = deepClone(DEFAULT_URBEX_RESPONSE);

defaults.url = new URLParser(SERVER_URL);
defaults.headers = new UrbexHeaders();

const client = urbex.isolateClient({
    url: defaults.url.href
});

describe("transformers", () => {
    it("default transformers should be defined", () => {
        chai.expect(transformResponseData).to.exist;
        chai.expect(transformRequestData).to.exist;
        chai.expect(decodeResponseData).to.exist;
    });

    it("should register the transformers on the client", () => {
        const requestPipelines = client.config.pipelines.request;
        const responsePipelines = client.config.pipelines.response;

        if (urbex.environment.isNode) {
            chai.expect(requestPipelines).to.be.lengthOf(1);
            chai.expect(responsePipelines).to.be.lengthOf(2);
        } else {
            chai.expect(requestPipelines).to.be.lengthOf(1);
            chai.expect(responsePipelines).to.be.lengthOf(1);
        }
    });

    describe("transformRequestData", () => {
        it("should set the data to undefind if the request method does not support a body", async () => {
            const config = await transformRequestData.execute(
                merge(defaults, {
                    method: "GET",
                    data: "test"
                })
            );

            chai.expect(config.data).to.be.undefined;
            chai.expect(config.headers.get("Content-Type")).to.be.undefined;
        });

        it("should not touch the request body if its a Buffer, File, Blob or Stream", async () => {
            if (urbex.environment.isNode) {
                const bufferConfig = await transformRequestData.execute(
                    merge(defaults, {
                        method: "POST",
                        data: Buffer.from("test")
                    })
                );

                chai.expect(bufferConfig.data).to.be.instanceOf(Buffer);

                const streamConfig = await transformRequestData.execute(
                    merge(defaults, {
                        method: "POST",
                        data: new stream.Readable()
                    })
                );

                chai.expect(streamConfig.data).to.be.instanceOf(stream.Readable);
            } else {
                const fileConfig = await transformRequestData.execute(
                    merge(defaults, {
                        method: "POST",
                        data: new File([], "test")
                    })
                );

                chai.expect(fileConfig.data).to.be.instanceOf(File);

                const blobConfig = await transformRequestData.execute(
                    merge(defaults, {
                        method: "POST",
                        data: new Blob()
                    })
                );

                chai.expect(blobConfig.data).to.be.instanceOf(Blob);
            }
        });

        it("when passing an `ArrayBuffer` or `ArrayBufferView` it should be converted to a `Buffer`", async () => {
            const arrayBufferConfig = await transformRequestData.execute(
                merge(defaults, {
                    method: "POST",
                    data: new ArrayBuffer(8)
                })
            );

            if (urbex.environment.isNode) {
                chai.expect(arrayBufferConfig.data).to.be.instanceOf(Buffer);
            } else {
                chai.expect(arrayBufferConfig.data).to.be.instanceOf(Blob);
            }

            const uint8ArrayConfig = await transformRequestData.execute(
                merge(defaults, {
                    method: "POST",
                    data: new Uint8Array(8)
                })
            );

            if (urbex.environment.isNode) {
                chai.expect(uint8ArrayConfig.data).to.be.instanceOf(Buffer);
            } else {
                chai.expect(uint8ArrayConfig.data).to.be.instanceOf(Blob);
            }
        });

        it("when passing an `ArrayBuffer` or `ArrayBufferView` it should set the `Content-Length` header", async () => {
            const arrayBuffer = new ArrayBuffer(8);

            const arrayBufferConfig = await transformRequestData.execute(
                merge(defaults, {
                    method: "POST",
                    data: arrayBuffer
                })
            );

            const uint8ArrayBuffer = new Uint8Array(8);
            const uint8ArrayConfig = await transformRequestData.execute(
                merge(defaults, {
                    method: "POST",
                    data: uint8ArrayBuffer
                })
            );

            const abContentLength = arrayBufferConfig.headers.get("Content-Length");
            const abvContentLength = uint8ArrayConfig.headers.get("Content-Length");

            chai.expect(abContentLength).to.equal(arrayBuffer.byteLength.toString());
            chai.expect(abvContentLength).to.equal(uint8ArrayBuffer.byteLength.toString());
        });

        it("should stringify the request body if its an object and set the `Content-Type` header", async () => {
            const config = await transformRequestData.execute(
                merge(defaults, {
                    method: "POST",
                    data: {
                        test: "test"
                    }
                })
            );

            chai.expect(config.data).to.be.a("string");
            chai.expect(config.data).to.equal('{"test":"test"}');
            chai.expect(config.headers.get("Content-Type")).to.equal("application/json");

            const array = await transformRequestData.execute(
                merge(defaults, {
                    method: "POST",
                    data: ["test"]
                })
            );

            chai.expect(array.data).to.be.a("string");
            chai.expect(array.data).to.equal('["test"]');
            chai.expect(array.headers.get("Content-Type")).to.equal("application/json");
        });

        it("should set the `Content-Type` to `text/plain` if the request body is a string", async () => {
            const config = await transformRequestData.execute(
                merge(defaults, {
                    method: "POST",
                    data: "test"
                })
            );

            chai.expect(config.headers.get("Content-Type")).to.equal("text/plain");
        });

        it("should convert `URLSearchParams` to a string and set the `Content-Type` header", async () => {
            const config = await transformRequestData.execute(
                merge(defaults, {
                    method: "POST",
                    data: new URLSearchParams("test=test")
                })
            );

            chai.expect(config.data).to.be.a("string");
            chai.expect(config.data).to.equal("test=test");
            chai.expect(config.headers.get("Content-Type")).to.equal(
                "application/x-www-form-urlencoded"
            );
        });
    });

    describe("transformResponseData", () => {
        it("should convert JSON data to an object if `responseType` is `json`", async () => {
            const response = await client.send({
                url: "/json",
                responseType: "json"
            });

            chai.expect(response.data).to.be.an("object");
        });
    });
});
