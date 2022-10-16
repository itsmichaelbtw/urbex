import {
    isArray,
    isObject,
    isUndefined,
    hasOwnProperty,
    forEach,
    deepMerge,
    capitalize
} from "../utils";
import { debug } from "../debug";

type UrbexHeaderValues = string | number | boolean | null | undefined;
type ObjectHeaders = Record<string, UrbexHeaderValues>;
type ArrayHeaders = Array<[string, UrbexHeaderValues]>;

export type BaseUrbexHeaders = ObjectHeaders;

const DefaultHeaders = {
    "Content-Type": "application/json"
};

function parseHeaderKey(key: string): string {
    if (key) {
        return formatHeaderKey(key.toLowerCase()).trim();
    }

    return undefined;
}

function parseHeaderValue(value: UrbexHeaderValues): string {
    if (isUndefined(value) || value === false || value === null) {
        return undefined;
    }

    if (isArray(value)) {
        return value.join(", ");
    }

    if (isObject(value)) {
        return JSON.stringify(value);
    }

    return String(value);
}

function normalizeHeaders(headers: BaseUrbexHeaders): ObjectHeaders {
    const newHeaders: BaseUrbexHeaders = {};

    forEach(headers, (key, value) => {
        if (isUndefined(key) || isUndefined(value)) {
            return;
        }

        const normalizedKey = parseHeaderKey(key);
        const normalizedValue = parseHeaderValue(value);

        if (normalizedKey && normalizedValue) {
            newHeaders[normalizedKey] = normalizedValue;
        }
    });

    return newHeaders;
}

function formatHeaderKey(key: string): string {
    if (isUndefined(key)) {
        return undefined;
    }

    return key.split("-").map(capitalize).join("-");
}

export class UrbexHeaders {
    protected $headers: BaseUrbexHeaders = {};

    constructor() {
        this.set(DefaultHeaders);
    }

    get defaults(): typeof DefaultHeaders {
        return DefaultHeaders;
    }

    /**
     * Set a header configuration to use for all requests made by the current
     * instance of the Urbex client
     *
     * Setting a configuration will merge with any existing configuration.
     * Optionally, you can pass a boolean to clear the existing configuration
     *
     * @param headers The headers to set
     * @param merge Whether to merge the headers with the existing configuration
     */
    set(headers?: BaseUrbexHeaders, merge: boolean = true): BaseUrbexHeaders {
        if (!isObject(headers)) {
            debug(
                "error",
                `Attempted to set headers with a non-object value: ${typeof headers}`
            );
            return headers;
        }

        const normalizedHeaders = normalizeHeaders(headers);
        const merged = merge
            ? deepMerge(this.$headers, normalizedHeaders)
            : normalizedHeaders;

        return (this.$headers = merged);
    }
    /**
     * Get the current headers object
     */
    get(): BaseUrbexHeaders {
        return this.$headers;
    }
    /**
     * Delete a header from the headers object
     */
    delete(key: string): void {
        forEach(this.$headers, (headerKey) => {
            if (headerKey.toLowerCase() === key.toLowerCase()) {
                delete this.$headers[headerKey];
            }
        });
    }
    /**
     *
     * Clear all headers that have been set
     * @param empty Whether to empty the headers object
     *
     */
    clear(empty: boolean = false): void {
        this.$headers = {};

        if (!empty) {
            this.set(DefaultHeaders);
        }
    }
}
