import type { ClockOptions } from "cache-clock";

import type { UrbexHeaders } from "./core/headers";
import type { URLParser } from "./core/parsers/url-parser";
import type {
    BaseConfiguration,
    CustomSearchParams,
    Headers,
    ResponseTypes,
    ResponseCachable,
    Port,
    ParsedURLComponent
} from "./types";

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
export type UrbexURL = Partial<URLComponent> | string;

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

// I want to replace the `search` property on the URLComponent interface with this:
// search: string
// how can I do this without having to copy the entire interface and also losing documentation?

/**
 * The return type when configuring the `urbex` client.
 */
export type InternalConfiguration<D = any> = BaseConfiguration<D> & {
    /**
     * The url that was provided has been parsed and is ready to be used.
     */
    url: URLParser;
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
    /**
     * The status code of the response.
     */
    status: number;
    /**
     * The status text of the response.
     */
    statusText: string;
    /**
     * The headers of the response.
     */
    headers: any;
    /**
     * The data of the response.
     */
    data: D;
    /**
     * The request configuration that was used to make the request.
     */
    config: InternalConfiguration;
    /**
     * The request that was made.
     */
    request: any;
    /**
     * The response that was received.
     */
    response: any;
    /**
     * The time it took to make the request in `ms`. This includes
     * any pipelines that were also executed.
     *
     * Uses `Date.now()` to calculate the time.
     */
    duration: number;
    /**
     * The time the request was made as an ISO string.
     */
    timestamp: string;
    /**
     * An object indicating its interaction with the cache.
     */
    cache: ResponseCachable;
    /**
     * The response type that was used to make the request.
     */
    responseType: ResponseTypes;
}

/**
 * The base URL component object.
 */
export interface URLComponent<SearchType = CustomSearchParams, PortType = Port> {
    /**
     * The full URL string of the component.
     *
     * This value takes **precedence** over all other values when
     * deserializing a component.
     */
    href: string;
    /**
     * The origin of the component in the form of
     * `<protocol>://<hostname>:<port>`.
     *
     * This value takes **precedence** over the `protocol`,
     * `hostname` and `port` values when serializing a component.
     */
    origin: string;
    /**
     * The protocol of the URL.
     */
    protocol: string;
    /**
     * The username of the URL.
     *
     * This value takes **precedence** over the `username` token
     * in the `origin` value when serializing a component.
     */
    username: string;
    /**
     * The password of the URL.
     *
     * This value takes **precedence** over the `password` token
     * in the `origin` value when serializing a component.
     */
    password: string;
    /**
     * The hostname of the URL.
     */
    hostname: string;
    /**
     * The port of the URL.
     */
    port: PortType;
    /**
     * The pathname of the URL.
     */
    pathname: string;
    /**
     * The search parameters of the URL as a string.
     *
     * Accepts an array, object or string.
     *
     * This value takes **precedence** over the `searchParams` value.
     */
    search: SearchType;
    /**
     * The search parameters of the URL as an URLSearchParams object.
     */
    searchParams: URLSearchParams;
    /**
     * The hash or fragment of the URL.
     */
    hash: string;
}

/**
 * The base error class that gets thrown when a request fails.
 */
export interface UrbexErrorType {
    /**
     * The status of the error.
     */
    status: number;
    /**
     * The config object that was used to make the request.
     */
    config: InternalConfiguration;
    /**
     * The request object that was used to make the request.
     */
    request: any;
    /**
     * The response object that was returned from the request.
     */
    response: UrbexResponse;
    /**
     * The error message.
     */
    message: string;
}
