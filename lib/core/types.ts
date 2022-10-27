import type { RequestUrlPath, Methods } from "../types";
import type { BaseUrbexHeaders, UrbexHeaders } from "./headers";
import type { CacheOptions } from "../ttl-cache/ttl-cache";

export type URIOptions = any;
export type URLProtocol = "http" | "https";
export type SearchParams =
    | URLSearchParams
    | Record<string, any>
    | string
    | null;
export type UrbexURL = BaseURIComponent | RequestUrlPath;

export type DispatchedResponse = Promise<UrbexResponse>;

export interface UrbexResponse {
    data: any;
    headers: any;
    status: number;
    statusText: string;
    request: any;
}

/**
 * Request API that powers the `urbex` client under the hood.
 */
export interface UrbexRequestApi {
    send(config: ParsedClientConfiguration): DispatchedResponse;
}

// // provided to the client as pass through options
export interface BaseURIComponent {
    /**
     * The transport protocol to use.
     *
     * Defaults to `https://`.
     */
    protocol?: URLProtocol;
    /**
     * The hostname name to use. If the hostname is not specified, the current domain
     * will be used. If `environment.isNode` is `true`, then localhost is used.
     *
     * The subdomain, domain and tld will be extracted from the hostname.
     *
     * E.g. if
     * the hostname is `https://api.example.com/api/v1`, then the hostname will be `api.example.com`.
     */
    hostname?: string;
    /**
     * If you are making a request that has an api mounted at a different url path, you
     * can set it here. This is designed to remove the cumbersome task of specifying the full
     * url path for each request.
     *
     * E.g. if you are making a request to `https://example.com/api/v1`, you can set the urlMount to
     * `/api/v1` and all requests will be made to that url.
     *
     * If you do not require this functionality, default it to `null` or `undefined` within the global
     * configuration.
     *
     * Defaults to `/api`.
     */
    urlMount?: string | null;
    /**
     *
     * The endpoint to use. This is the path that will be appended to the hostname, and after the
     * urlMount, if one is present.
     */
    endpoint?: string;
    /**
     * The port to use.
     *
     * If you do not require this functionality, default it to `null` or `undefined` within the global
     * configuration.
     */
    port?: number | string | null;
}
export interface URIComponent extends BaseURIComponent {
    /**
     * The full url of the request that was passed to the client.
     */
    href?: string;
    /**
     * The origin of the url.
     */
    origin?: string;
    /**
     * The query string to use in the request.
     */
    params?: SearchParams;
}

interface BaseConfiguration {
    /**
     * Set the default request method to use. This is useful if you find
     * yourself using the same method for all requests.
     *
     * It is recommended when setting this option, to instead use
     * `urbex.send()`. This will use the method specified in the
     * request options.
     *
     * Defaults to "GET".
     */
    method?: Methods;
    /**
     * Set the default headers to use for all requests.
     *
     * Any additional headers passed to the request will not be merged
     * with the default headers.
     */
    headers?: BaseUrbexHeaders;
    /**
     * Set the default data to use.
     *
     * Any additional data passed to the request will not be merged
     * with the default data.
     */
    data?: any;
    /**
     * Set the default timeout to use for all requests.
     *
     * Defaults to 0 (no timeout).
     */
    timeout?: number;
    /**
     * Control the internal ttl cache module. Provide a `ttl` value to enable the cache.
     */
    cache?: CacheOptions | false;
}

// strictly for external use only by the user

export type ConfigurableClientUrl = BaseURIComponent | RequestUrlPath;

export interface ConfigurableUrbexClient extends BaseConfiguration {
    /**
     * Configure the base url for the client.
     *
     * Note: When passing a URI object, the object will be merged with the default URI options.
     * If you wish to remove the default options, pass `null` as the value for the property.
     */
    url?: ConfigurableClientUrl;
    /**
     * The query string to use in the request.
     */
    params?: SearchParams;
}

// prettier-ignore
export interface ParsedClientConfiguration extends Omit<BaseConfiguration, "headers"> {
    /**
     * Configure the base url for the client.
     *
     * Note: When passing a URI object, the object will be merged with the default URI options.
     * If you wish to remove the default options, pass `null` as the value for the property.
     */
    url?: URIComponent;
    /**
     * The query string to use in the request.
     */
    params?: SearchParams;

    headers?: UrbexHeaders;
}

export type SafeParsedClientConfiguration = Omit<
    ParsedClientConfiguration,
    "headers"
> & {
    headers: Record<string, string>;
};
