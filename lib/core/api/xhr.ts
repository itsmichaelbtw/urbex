import type { InternalConfiguration } from "../../exportable-types";
import type {
    DispatchedResponse,
    UrbexRequestApi,
    DispatchedAPIRequest,
    ResponseTypes
} from "../../types";

import { UrbexError, TimeoutError } from "../error";
import { createEmptyScheme, uppercase, forEach, isUndefined, merge } from "../../utils";

type BrowserResponseTypes = "arraybuffer" | "blob" | "document" | "json" | "text";

const BROWSER_RESPONSE_TYPES = ["arraybuffer", "blob", "document", "json", "text"];

export class BrowserRequest implements UrbexRequestApi {
    public send(config: InternalConfiguration): DispatchedAPIRequest {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();

            request.open(uppercase(config.method), config.url.href, true);

            if (BROWSER_RESPONSE_TYPES.includes(config.responseType)) {
                request.responseType = config.responseType as BrowserResponseTypes;
            }

            if (isUndefined(config.data)) {
                config.headers.delete("Content-Type");
            }

            forEach(config.headers.get(), (key, value) => {
                request.setRequestHeader(key, value);
            });

            if (config.timeout) {
                request.timeout = config.timeout;
            }

            request.ontimeout = function () {};

            request.onabort = function () {};

            request.onerror = function () {};

            // https://plnkr.co/edit/ycQbBr0vr7ceUP2p6PHy?p=preview&preview

            request.onload = function () {
                resolve({
                    data: request.response || request.responseText,
                    request: request,
                    response: {
                        status: request.status,
                        statusText: request.statusText,
                        headers: request.getAllResponseHeaders()
                    }
                });
            };

            request.onreadystatechange = function () {};

            request.send(config.data);
        });
    }
}

export const DECODERS = createEmptyScheme(["br", "gzip", "deflate", "compress"]);
