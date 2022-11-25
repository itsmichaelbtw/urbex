import type { InternalConfiguration } from "../../exportable-types";
import type {
    DispatchedResponse,
    UrbexRequestApi,
    DispatchedAPIRequest,
    ResponseTypes
} from "../../types";

import { resolveRequest } from "./resolve-request";
import { UrbexError, TimeoutError, NetworkError } from "../error";
import { createEmptyScheme, uppercase, forEach, isUndefined, merge } from "../../utils";

interface BindableEventListener {
    event: string;
    listener: XMLEventListener;
}

type BrowserResponseTypes = "arraybuffer" | "blob" | "document" | "json" | "text";
type XMLProgressEvent = ProgressEvent<EventTarget>;

type XMLEventListener = (this: XMLHttpRequest, ev: XMLProgressEvent) => void;
type XMLEventListeners = BindableEventListener[];

const BROWSER_RESPONSE_TYPES = ["arraybuffer", "blob", "document", "json", "text"];

export class BrowserRequest implements UrbexRequestApi {
    public send(config: InternalConfiguration): DispatchedAPIRequest {
        return new Promise((_resolve, _reject) => {
            const request = new XMLHttpRequest();

            function manageListeners(
                listeners: XMLEventListeners,
                method: "addEventListener" | "removeEventListener"
            ) {
                for (const { event, listener } of listeners) {
                    request[method](event, listener);
                }
            }

            request.open(uppercase(config.method), config.url.href, true);

            if (
                BROWSER_RESPONSE_TYPES.includes(config.responseType) &&
                config.responseType !== "json"
            ) {
                request.responseType = config.responseType as BrowserResponseTypes;
            }

            if (isUndefined(config.data)) {
                config.headers.delete("Content-Type");
            }

            forEach(config.headers.get(), request.setRequestHeader.bind(request));

            if (config.timeout) {
                request.timeout = config.timeout;
            }

            function resolve(response: any): void {
                return resolveRequest.call({ config, request }, _resolve, _reject, response);
            }

            function createErrorInstance<T extends typeof UrbexError>(
                instance: T
            ): InstanceType<T> {
                return UrbexError.createErrorInstance.call({ config, request }, instance);
            }

            function onTimeout(this: XMLHttpRequest, ev: XMLProgressEvent): void {
                const timeoutError = createErrorInstance(TimeoutError);
                timeoutError.timeout = config.timeout;
                _reject(timeoutError);

                manageListeners(listeners, "removeEventListener");
            }

            function onAbort(this: XMLHttpRequest, ev: XMLProgressEvent): void {
                const abortError = createErrorInstance(UrbexError);
                abortError.message = "The request was aborted.";
                _reject(abortError);

                manageListeners(listeners, "removeEventListener");
            }

            function onError(this: XMLHttpRequest, ev: XMLProgressEvent): void {
                // https://stackoverflow.com/questions/45067892/xmlhttprequest-onerror-handler-use-case

                const networkError = createErrorInstance(NetworkError);
                _reject(networkError);

                manageListeners(listeners, "removeEventListener");
            }

            function onLoad(this: XMLHttpRequest, ev: XMLProgressEvent): void {
                // Uncaught DOMException: XMLHttpRequest.responseText
                // getter: responseText is only available if responseType is '' or 'text'.
                // thats why the below function exists

                function getResponse() {
                    if (request.responseType === "document") {
                        return request.responseXML;
                    }

                    if (!request.responseType || request.responseType === "text") {
                        return request.responseText;
                    }

                    return request.response;
                }

                resolve({
                    data: getResponse(),
                    request: request,
                    response: {
                        status: request.status,
                        statusText: request.statusText,
                        headers: request.getAllResponseHeaders()
                    }
                });

                manageListeners(listeners, "removeEventListener");
            }

            const listeners: XMLEventListeners = [
                { event: "timeout", listener: onTimeout },
                { event: "abort", listener: onAbort },
                { event: "error", listener: onError },
                { event: "load", listener: onLoad }
            ];

            manageListeners(listeners, "addEventListener");

            // https://plnkr.co/edit/ycQbBr0vr7ceUP2p6PHy?p=preview&preview

            request.onreadystatechange = function () {};

            request.send(config.data);
        });
    }
}

// this is here because when building for the browser, the http api
// is replaced with the xhr api. And so it doesn't throw errors
// this is here for safety
export const DECODERS = createEmptyScheme(["br", "gzip", "deflate", "compress"]);
