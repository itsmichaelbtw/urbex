import type { ClockOptions } from "cache-clock";

import type { UrbexHeaders } from "./core/headers";
import type { BaseConfiguration, SearchParams, Headers } from "./types";

/**
 * The callback to provide when creating a new pipeline executor for a request.
 */
export type RequestExecutor = (config: InternalConfiguration) => Promise<InternalConfiguration>;

/**
 * The callback to provide when creating a new pipeline executor for a response.
 */
export type ResponseExecutor = (config: UrbexResponse) => Promise<UrbexResponse>;

/**
 * A customizable url object.
 */
export type UrbexURL = Partial<URIComponent> | string;

/**
 * A configuration object for the `urbex` client used to make requests.
 */
export type UrbexConfig<D = any> = Partial<BaseConfiguration<D>> & {
    /**
     * Configure the base url for the client.
     *
     * Note: When passing a URI object, the object will be merged with the default URI options.
     * If you wish to remove the default options, pass `null` as the value for the property.
     */
    url?: UrbexURL;
    /**
     * Custom headers to be sent with the request. These headers will be merged with the default headers.
     */
    headers?: Headers;
};

/**
 * The return type when configuring the `urbex` client.
 */
export type InternalConfiguration<D = any> = BaseConfiguration<D> & {
    /**
     * The url that was provided has been parsed and is ready to be used.
     */
    url: URIComponent;
    /**
     * The headers object representing the headers that will be sent with the request.
     *
     * This uses the internal `UrbexHeaders` class. You are free to use the provided methods.
     */
    headers: UrbexHeaders;
};

/**
 * The response object returned by the `urbex` client when a request is successful.
 */
export interface UrbexResponse<D = any> {
    data: D;
    headers: any;
    status: number;
    statusText: string;
    request: any;
}

/**
 * The base uri component object.
 */
export interface URIComponent {
    /**
     * The full url of the request that was passed to the client.
     */
    href: string;
    /**
     * The origin of the url.
     */
    origin: string;
    /**
     * The transport protocol to use.
     *
     * Defaults to `https://`.
     */
    protocol: string;
    /**
     * The hostname name to use. If the hostname is not specified, the current domain
     * will be used. If `environment.isNode` is `true`, then localhost is used.
     *
     * The subdomain, domain and tld will be extracted from the hostname.
     *
     * E.g. if
     * the hostname is `https://api.example.com/api/v1`, then the hostname will be `api.example.com`.
     */
    hostname: string;
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
    urlMount: string | null;
    /**
     *
     * The endpoint to use. This is the path that will be appended to the hostname, and after the
     * urlMount, if one is present.
     */
    endpoint: string;
    /**
     * The port to use.
     *
     * If you do not require this functionality, default it to `null` or `undefined` within the global
     * configuration.
     */
    port: number | string | null;
    /**
     * The query string to use in the request.
     */
    params: SearchParams;
}
