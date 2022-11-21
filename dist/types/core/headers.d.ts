import type { Headers, NormalizedHeaders } from "../types";
import { DEFAULT_BROWSER_HEADERS, DEFAULT_NODE_HEADERS } from "./constants";
export declare class UrbexHeaders {
    protected $headers: NormalizedHeaders;
    constructor(headers?: Headers, withDefaults?: boolean);
    static construct(headers?: Headers, withDefaults?: boolean): UrbexHeaders;
    get defaults(): typeof DEFAULT_NODE_HEADERS | typeof DEFAULT_BROWSER_HEADERS;
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
    set(headers?: Headers, forceMerge?: boolean): Headers;
    /**
     * Get the current headers object
     */
    get(): NormalizedHeaders;
    /**
     * Whether the headers object contains a given header
     */
    has(key: string): boolean;
    /**
     * Delete a header from the headers object
     */
    delete(key: string): void;
    /**
     *
     * Clear all headers that have been set
     * @param empty Whether to empty the headers object
     *
     */
    clear(empty?: boolean): void;
    /**
     * Normalize an incoming headers object
     */
    normalize(headers: Headers): NormalizedHeaders;
}
