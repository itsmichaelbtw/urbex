import type { RequestExecutor, ResponseExecutor } from "../exportable-types";

import { PipelineExecutor } from "./pipelines";
import { environment } from "../environment";
import { DECODERS } from "./api/http";

export const transformRequestData = new PipelineExecutor<RequestExecutor>((config) => {
    return Promise.resolve(config);
});

export const decodeResponseData = new PipelineExecutor<ResponseExecutor>(async (response) => {
    const responseType = response.config.responseType;

    if (responseType === "raw" || responseType === "stream") {
        return Promise.resolve(response);
    }

    const encoding = response.headers["content-encoding"];

    if (Buffer.isBuffer(response.data) && response.data.length) {
        if (encoding) {
            const decoder = DECODERS[encoding];

            if (decoder) {
                const decompressed = await decoder(response.data);
                const maxContentLength = response.config.maxContentLength;

                if (maxContentLength > -1 || maxContentLength !== Infinity) {
                    if (decompressed.length > maxContentLength) {
                        throw new Error(
                            `Content length of ${decompressed.length} exceeds the maxContentLength of ${maxContentLength}`
                        );
                    }
                }

                response.data = decompressed;
            }
        }
    } else {
        response.data = null;
    }

    return Promise.resolve(response);
});

export const transformResponseData = new PipelineExecutor<ResponseExecutor>((response) => {
    const responseType = response.config.responseType;

    if (responseType === "raw" || responseType === "arraybuffer" || responseType === "stream") {
        return Promise.resolve(response);
    }

    if (response.data) {
        // https://stackoverflow.com/questions/24356713/node-js-readfile-error-with-utf8-encoded-file-on-windows

        const { responseEncoding, responseType } = response.config;

        const bufferString = response.data.toString(responseEncoding);

        if (responseType === "json") {
            response.data = JSON.parse(bufferString);
        } else {
            response.data = bufferString;
        }
    }

    return Promise.resolve(response);
});
