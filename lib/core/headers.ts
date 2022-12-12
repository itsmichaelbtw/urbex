import type { Headers, HeaderValues, NormalizedHeaders } from "../types";

import {
    isArray,
    isObject,
    isUndefined,
    hasOwnProperty,
    forEach,
    merge,
    capitalize,
    argumentIsNotProvided,
    isEmpty,
    isString,
    lowercase,
    stringReplacer
} from "../utils";
import { debug } from "../debug";
import { environment } from "../environment";

const DEFAULT_BROWSER_HEADERS = {
    "Content-Type": "application/json"
};

const DEFAULT_NODE_HEADERS = merge(DEFAULT_BROWSER_HEADERS, {
    "User-Agent": `UrbexClient (Node.js ${environment.process.version}; ${environment.process.platform})`
});

function removeNewLines(value: string): string {
    return stringReplacer(value, "\n", "");
}

function parseHeaderKey(key: string): string {
    if (key) {
        const format = formatHeaderKey(lowercase(key)).trim();
        return removeNewLines(format);
    }

    return undefined;
}

function parseHeaderValue(value: HeaderValues): string {
    if (isUndefined(value) || value === false || value === null) {
        return undefined;
    }

    if (isArray(value)) {
        return value.join(", ");
    }

    if (isObject(value)) {
        return JSON.stringify(value);
    }

    const newValue = value.toString().trim();
    return removeNewLines(newValue);
}

function normalizeHeaders(headers: Headers): NormalizedHeaders {
    const newHeaders: NormalizedHeaders = {};

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
    // split by the dash
    // capitalize each word
    // join the words back together

    const words = key.split("-");
    const formattedWords = words.map((word) => {
        const parsedWord = removeNewLines(word).trim();

        if (parsedWord) {
            return capitalize(parsedWord);
        }
    });
    return formattedWords.join("-");
}

export class UrbexHeaders {
    protected $headers: NormalizedHeaders = {};

    constructor(headers?: Headers, withDefaults = true) {
        if (withDefaults) {
            this.set(this.defaults, false);
        }

        if (isObject(headers) && !isEmpty(headers)) {
            this.set(headers, withDefaults);
        }
    }

    static construct(headers: Headers = {}, withDefaults = true): UrbexHeaders {
        return new UrbexHeaders(headers, withDefaults);
    }

    /**
     * Parse a headers string into an object
     */
    static parse(headers: string): NormalizedHeaders {
        if (argumentIsNotProvided(headers) || !isString(headers)) {
            return {};
        }

        const parsedHeaders: NormalizedHeaders = {};

        const lines = headers.split("\r");

        forEach(lines, (index, pair) => {
            const [pairKey, pairValue] = pair.toString().split(":");

            const key = parseHeaderKey(pairKey);
            const value = parseHeaderValue(pairValue);

            if (key && value) {
                parsedHeaders[key] = value;
            }
        });

        return parsedHeaders;
    }

    get defaults(): typeof DEFAULT_NODE_HEADERS | typeof DEFAULT_BROWSER_HEADERS {
        return environment.isNode ? DEFAULT_NODE_HEADERS : DEFAULT_BROWSER_HEADERS;
    }

    /**
     * Set a header configuration to use for all requests made by the current
     * instance of the Urbex client
     *
     * Setting a configuration will merge with any existing configuration.
     * Optionally, you can pass a boolean to clear the existing configuration
     *
     * @param headers The headers to set
     * @param forceMerge Whether to merge the headers with the existing configuration
     */
    public set(headers?: Headers, forceMerge = true): Headers {
        if (!isObject(headers)) {
            debug("error", `Attempted to set headers with a non-object value: ${typeof headers}`);
            return headers;
        }

        const normalizedHeaders = this.normalize(headers);
        const merged = forceMerge ? merge(this.$headers, normalizedHeaders) : normalizedHeaders;

        return (this.$headers = merged);
    }
    /**
     * Get the current headers object
     */
    public get(): NormalizedHeaders {
        return this.$headers;
    }

    /**
     * Whether the headers object contains a given header
     */
    public has(key: string): boolean {
        return hasOwnProperty(this.$headers, parseHeaderKey(key));
    }

    /**
     * Delete a header from the headers object
     */
    public delete(key: string): void {
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
    public clear(empty = false): void {
        this.$headers = {};

        if (!empty) {
            this.set(this.defaults, false);
        }
    }

    /**
     * Normalize an incoming headers object
     */
    public normalize(headers: Headers): NormalizedHeaders {
        if (argumentIsNotProvided(headers) || !isObject(headers)) {
            return {};
        }

        return normalizeHeaders(headers);
    }
}
