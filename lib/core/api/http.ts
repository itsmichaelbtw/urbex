import http from "http";
import https from "https";
import url from "url";
import zlib from "zlib";
import util from "util";
import stream from "stream";

import type { InternalConfiguration } from "../../exportable-types";
import type { DispatchedResponse, UrbexRequestApi, DispatchedAPIRequest } from "../../types";

import {
    combineStrings,
    argumentIsNotProvided,
    toStringCall,
    isString,
    ensureLeadingToken,
    ensureTrailingToken,
    isFunction
} from "../../utils";
import { UrbexError, TimeoutError } from "../error";

export class NodeRequest implements UrbexRequestApi {
    private getAgentFromProtocol(protocol: string): typeof http | typeof https {
        if (protocol === "https") {
            return https;
        }

        return http;
    }

    private handleDataProtocolRequest(config: InternalConfiguration): DispatchedAPIRequest {
        return new Promise((resolve, reject) => {
            resolve({
                data: null,
                request: null,
                response: null
            });
        });
    }

    public async send(config: InternalConfiguration): DispatchedAPIRequest {
        return new Promise((resolve, reject) => {
            const agent = this.getAgentFromProtocol(config.url.protocol);

            if (config.url.protocol === "data") {
                return this.handleDataProtocolRequest(config);
            }

            if (!config.headers.has("Accept-Encoding")) {
                config.headers.set({ "Accept-Encoding": "gzip, deflate, br" });
            }

            if (config.url.params && !isString(config.url.params)) {
                config.url.params = config.url.params.toString();
            } else {
                config.url.params = "";
            }

            function onError(error: any): void {
                const err = new UrbexError(error);
                err.config = config;
                err.request = request;
                return reject(err);
            }

            const options: https.RequestOptions | url.URL = {
                protocol: ensureTrailingToken(":", config.url.protocol),
                href: config.url.href,
                hostname: config.url.hostname,
                path: combineStrings("", config.url.endpoint, config.url.params),
                headers: config.headers.get(),
                timeout: config.timeout
            };

            if (config.url.port) {
                const port = parseInt(config.url.port.toString());

                if (!isNaN(port)) {
                    options.port = port;
                }
            }

            const request = agent.request(options);

            request.on("response", (response) => {
                if (response.destroyed || request.destroyed) {
                    return onError(new UrbexError("Request was destroyed."));
                }

                if (config.responseType === "stream") {
                    return resolve({
                        data: response,
                        request: request,
                        response: response
                    });
                }

                const chunks: Buffer[] = [];

                response.on("data", chunks.push.bind(chunks));

                response.on("error", onError);

                response.on("close", () => {
                    if (response.complete) {
                        return;
                    }

                    response.destroy();
                    request.destroy();
                    return onError(new UrbexError("Request was closed prematurely."));
                });

                response.on("end", () => {
                    const body = Buffer.concat(chunks);

                    resolve({ data: body, request: request, response: response });
                });
            });

            if (config.timeout) {
                request.setTimeout(config.timeout, () => {
                    reject(new TimeoutError(config.timeout));
                });
            }

            request.on("error", onError);
            request.end(config.data ?? undefined);
        });
    }
}

const br = isFunction(zlib.brotliDecompress) ? util.promisify(zlib.brotliDecompress) : null;
const gzip = isFunction(zlib.gunzip) ? util.promisify(zlib.gunzip) : null;
const deflate = isFunction(zlib.inflate) ? util.promisify(zlib.inflate) : null;
const compress = isFunction(zlib.createUnzip) ? util.promisify(zlib.createUnzip) : null;

export const DECODERS = { br, gzip, deflate, compress };
