import http from "http";
import https from "https";
import url from "url";
import zlib from "zlib";
import util from "util";
import stream from "stream";

import type { InternalConfiguration } from "../../exportable-types";
import type {
    DispatchedResponse,
    UrbexRequestApi,
    DispatchedAPIRequest,
    ResolvableEntity
} from "../../types";

import { resolveRequest } from "./resolve-request";
import { UrbexError, TimeoutError, NetworkError } from "../error";
import { combineStrings, isString, ensureTrailingToken, isFunction } from "../../utils";

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
        return new Promise((_resolve, _reject) => {
            const agent = this.getAgentFromProtocol(config.url.protocol);

            if (config.url.protocol === "data") {
                return this.handleDataProtocolRequest(config);
            }

            if (!config.headers.has("Accept-Encoding")) {
                config.headers.set({ "Accept-Encoding": "gzip, deflate, br" });
            }

            const options: https.RequestOptions | url.URL = {
                protocol: ensureTrailingToken(":", config.url.protocol),
                href: config.url.href,
                hostname: config.url.hostname,
                path: combineStrings("", config.url.pathname, config.url.search),
                headers: config.headers.get(),
                timeout: config.timeout
            };

            if (config.url.port) {
                options.port = config.url.port;
            }

            const request = agent.request(options);

            function resolve(response: ResolvableEntity): void {
                return resolveRequest.call({ config, request }, _resolve, _reject, response);
            }

            function createErrorInstance<T extends typeof UrbexError>(
                instance: T
            ): InstanceType<T> {
                return UrbexError.createErrorInstance.call({ config, request }, instance);
            }

            function onData(this: Buffer[], data: any): void {
                this.push(data);
            }

            function onError(this: http.IncomingMessage, error: Error): void {
                if (error instanceof UrbexError) {
                    return _reject(error);
                }

                const errorInstance = createErrorInstance(NetworkError);
                errorInstance.message = error.message;
                return _reject(errorInstance);
            }

            function onClose(this: http.IncomingMessage): void {
                if (this.complete || this.aborted || this.destroyed) {
                    return;
                }

                this.destroy();
                request.destroy();
            }

            function onEnd(this: Buffer[], response: http.IncomingMessage): void {
                const body = Buffer.concat(this);

                resolve({ data: body, request: request, response: response });
                onClose.call(response);
            }

            function onTimeout(): void {
                const timeoutError = createErrorInstance(TimeoutError);
                timeoutError.timeout = config.timeout;

                request.destroy(timeoutError);
            }

            function onResponse(response: http.IncomingMessage): void {
                if (response.destroyed || request.destroyed) {
                    return;
                }

                if (config.responseType === "stream") {
                    return resolve({
                        data: response,
                        request: request,
                        response: response
                    });
                }

                const chunks: Buffer[] = [];

                response.on("data", (chunk) => {
                    onData.call(chunks, chunk);
                });

                response.on("error", (error) => {
                    onError.call(response, error);
                });

                response.on("close", () => {
                    onClose.call(response);
                });

                response.on("end", () => {
                    onEnd.call(chunks, response);
                });
            }

            request.on("response", onResponse);

            request.on("error", (error) => {
                onError.call(request, error);
            });

            if (config.timeout) {
                request.on("timeout", onTimeout);
            }

            request.end(config.data ?? undefined);
        });
    }
}

const br = isFunction(zlib?.brotliDecompress) ? util.promisify(zlib.brotliDecompress) : null;
const gzip = isFunction(zlib?.gunzip) ? util.promisify(zlib.gunzip) : null;
const deflate = isFunction(zlib?.inflate) ? util.promisify(zlib.inflate) : null;
const compress = isFunction(zlib?.createUnzip) ? util.promisify(zlib.createUnzip) : null;

export const DECODERS = { br, gzip, deflate, compress };
