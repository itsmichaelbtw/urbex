import type { RequestExecutor, ResponseExecutor } from "../exportable-types";

import { REQUEST_BODY_METHODS } from "./constants";
import { PipelineExecutor } from "./pipelines";
import { environment } from "../environment";
import { DECODERS } from "./api/http";
import {
    isNil,
    isObject,
    isArray,
    isArrayBuffer,
    isArrayBufferView,
    isString,
    isBuffer,
    isFile,
    isBlob,
    isStream,
    isFunction,
    safeJSONParse,
    safeStringify,
    uppercase,
    ensureContentLength,
    convertToEncodedForm,
    isObjectLike
} from "../utils";

const SKIPPABLE_RESPONSE_TYPES = ["stream", "raw"];

function toBuffer(value: any): Buffer | Blob {
    if (environment.isNode) {
        return Buffer.from(value);
    }

    return new Blob([value]);
}

export const transformRequestData = new PipelineExecutor<RequestExecutor>((config) => {
    if (!REQUEST_BODY_METHODS.includes(uppercase(config.method))) {
        config.data = undefined;
        config.headers.delete("Content-Type");
    }

    if (
        isNil(config.data) ||
        isBuffer(config.data) ||
        isFile(config.data) ||
        isBlob(config.data) ||
        isStream(config.data)
    ) {
        return Promise.resolve(config);
    }

    if (isArrayBuffer(config.data) || isArrayBufferView(config.data)) {
        config.data = toBuffer(config.data);

        ensureContentLength.call(config.headers, config.data.byteLength);
        return Promise.resolve(config);
    }

    if (config.data instanceof URLSearchParams) {
        config.headers.set({
            "Content-Type": "application/x-www-form-urlencoded"
        });

        config.data = config.data.toString();
        return Promise.resolve(config);
    }

    if (isString(config.data)) {
        config.headers.set({
            "Content-Type": "text/plain"
        });
    }

    if (isObjectLike(config.data)) {
        const contentType = config.headers.get("Content-Type");

        if (contentType && contentType.includes("application/x-www-form-urlencoded")) {
            config.data = convertToEncodedForm(config.data);
        } else {
            config.headers.set({
                "Content-Type": "application/json"
            });

            config.data = safeStringify(config.data);
        }
    }

    return Promise.resolve(config);
});

// the below `decodeResponseData` is only used for NodeJS

export const decodeResponseData = new PipelineExecutor<ResponseExecutor>(async (response) => {
    const { responseType, maxContentLength } = response.config;

    if (SKIPPABLE_RESPONSE_TYPES.includes(responseType) || response.cache.pulled) {
        return Promise.resolve(response);
    }

    const encoding = response.headers["content-encoding"];

    if (isBuffer(response.data) && response.data.length) {
        const decoder = DECODERS[encoding];

        if (encoding && isFunction(decoder)) {
            const decompressed = await decoder(response.data);

            if (maxContentLength > -1 || maxContentLength !== Infinity) {
                if (decompressed.length > maxContentLength) {
                    throw new Error(
                        `Content length of ${decompressed.length} exceeds the maxContentLength of ${maxContentLength}`
                    );
                }
            }

            response.data = decompressed;
        }
    } else {
        response.data = undefined;
    }

    return Promise.resolve(response);
});

export const transformResponseData = new PipelineExecutor<ResponseExecutor>((response) => {
    const { responseType, responseEncoding } = response.config;

    if (
        SKIPPABLE_RESPONSE_TYPES.includes(responseType) ||
        responseType === "arraybuffer" ||
        response.cache.pulled
    ) {
        return Promise.resolve(response);
    }

    if (response.data) {
        let data = response.data;

        if (environment.isNode) {
            // https://stackoverflow.com/questions/24356713/node-js-readfile-error-with-utf8-encoded-file-on-windows

            data = response.data.toString(responseEncoding);
        }

        if (responseType === "json") {
            response.data = safeJSONParse(data, true);
        } else {
            response.data = data;
        }
    }

    return Promise.resolve(response);
});
