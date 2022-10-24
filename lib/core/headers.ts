import {
    isArray,
    isObject,
    isUndefined,
    hasOwnProperty,
    forEach,
    merge,
    capitalize,
    argumentIsNotProvided
} from "../utils";
import { debug } from "../debug";
import { environment, env } from "../environment";

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
    return key.split("-").map(capitalize).join("-");
}

export class UrbexHeaders {
    protected $headers: BaseUrbexHeaders = {};

    constructor() {
        if (environment.isNode) {
            this.set(
                merge(DefaultHeaders, {
                    "User-Agent": `UrbexClient (Node.js ${process.version}; ${process.platform})`
                })
            );

            return;
        }

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
     * @param forceMerge Whether to merge the headers with the existing configuration
     */
    public set(
        headers?: BaseUrbexHeaders,
        forceMerge: boolean = true
    ): BaseUrbexHeaders {
        if (!isObject(headers)) {
            debug(
                "error",
                `Attempted to set headers with a non-object value: ${typeof headers}`
            );
            return headers;
        }

        const normalizedHeaders = this.normalize(headers);
        const merged = forceMerge
            ? merge(this.$headers, normalizedHeaders)
            : normalizedHeaders;

        return (this.$headers = merged);
    }
    /**
     * Get the current headers object
     */
    public get(): BaseUrbexHeaders {
        return this.$headers;
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
    public clear(empty: boolean = false): void {
        this.$headers = {};

        if (!empty) {
            this.set(DefaultHeaders);
        }
    }

    public normalize(headers: BaseUrbexHeaders): ObjectHeaders {
        if (argumentIsNotProvided(headers) || !isObject(headers)) {
            return {};
        }

        return normalizeHeaders(headers);
    }
}
