import type { ClockOptions } from "cache-clock";

import type { PipelineExecutor } from "./core/pipelines";
import type { UrbexHeaders } from "./core/headers";
import type { UrbexError } from "./core/error";
import type {
    UrbexURL,
    URLComponent,
    UrbexResponse,
    InternalConfiguration,
    RequestExecutor,
    ResponseExecutor
} from "./exportable-types";

/**
 * Available response types for the request.
 */
export type ResponseTypes =
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream"
    | "raw";

export type Port = number | string;

/**
 * The URL component after parsing.
 */
export type ParsedURLComponent = URLComponent<string, number>;

/**
 * A type representing the `URL` object when attempting to serialize the object.
 */
export type SerializeComponent = Partial<URLComponent>;

/**
 * Enforce required properties on the `URL` object.
 */
export type EnforceComponent = URLComponent;

/**
 * User provided values for headers.
 */
export type HeaderValues = string | number | boolean | null | undefined;
/**
 * Post normalization headers.
 */
export type NormalizedHeaders = Record<string, string>;
/**
 * Headers object.
 */
export type Headers = Record<string, HeaderValues>;
/**
 * Search parameters object passed to the `url.search` property.
 */
export type CustomSearchParams =
    | [string, string | number | boolean | null | undefined][]
    | Record<string, any>
    | string
    | null;

export type MethodsUpper = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
export type MethodsLower = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

export type Methods = MethodsUpper | MethodsLower;
export type RequestUrlPath = string;

/**
 * A function that determines if the response should resolve or reject.
 */
export type ResolveStatus = (config: InternalConfiguration, status: number) => boolean;

/**
 * The resolved callback when a request has been fulfilled.
 */
export type DispatchedResponse = Promise<UrbexResponse>;

/**
 * The resolved callback when the request api has been made.
 */
export type DispatchedAPIRequest = Promise<RequestAPIResponse>;

export interface ResponseCachable {
    /**
     * The key that was used to pull the response from the cache.
     */
    key: string;
    /**
     * If the cache was hit during the request.
     */
    hit: boolean;
    /**
     * If the request had an active response in the cache.
     */
    pulled: boolean;
    /**
     * If the `new` response was stored in the cache.
     */
    stored: boolean;
}

/**
 * The response that is returned by the request api.
 */
export interface RequestAPIResponse {
    data?: any;
    request?: any;
    response?: any;
    cache?: ResponseCachable;
}

/**
 * An type representing an object.
 */
export interface IObject<V = any> {
    [key: string]: V;
}

/**
 * The execution manager for the request pipeline.
 */
export interface PipelineExecutorsManager {
    request?: PipelineExecutor<RequestExecutor>[];
    response?: PipelineExecutor<ResponseExecutor>[];
}

/**
 * The base configuration object.
 */
export interface BaseConfiguration<D = any> {
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
    method: Methods;
    /**
     * Set the default data to use.
     *
     * Any additional data passed to the request will not be merged
     * with the default data.
     *
     * Defaults to `null`.
     */
    data: D;
    /**
     * Set the default timeout to use for all requests.
     *
     * Defaults to `0` (no timeout).
     */
    timeout: number;
    /**
     * Control the internal ttl cache module. Provide a `ttl` value to enable the cache.
     *
     * See the [cache-clock](https://github.com/itsmichaelbtw/cache-clock)
     * documentation for more information.
     *
     * Defaults to `{}`.
     */
    cache: ClockOptions & {
        /**
         * Whether or not to enable the cache.
         */
        enabled?: boolean;
    };
    /**
     * Custom pipeline transformers to use. These are executed in the order
     * they are provided and on each request.
     */
    pipelines: PipelineExecutorsManager;
    /**
     * The max content length to allow for the response.
     *
     * Defaults to `Infinity`.
     */
    maxContentLength: number;
    /**
     * The response type to use for the request.
     *
     * Defaults to `json`.
     */
    responseType: ResponseTypes;
    /**
     * The encoding to use when converting the response to a string.
     *
     * Defaults to `utf8`.
     */
    responseEncoding: BufferEncoding;
    /**
     * A function that determines whether the request should be considered
     * successful or not.
     *
     * Provides the `InternalConfiguration` object and `status` code.
     */
    resolveStatus: ResolveStatus;
}

/**
 * The underlying request api that powers the client.
 */
export interface UrbexRequestApi {
    send(config: InternalConfiguration): DispatchedAPIRequest;
}
