import type { ClockOptions } from "cache-clock";

import type { PipelineExecutor } from "./core/pipelines";
import type { UrbexHeaders } from "./core/headers";
import type {
    UrbexURL,
    UrbexResponse,
    InternalConfiguration,
    RequestExecutor,
    ResponseExecutor
} from "./exportable-types";

/**
 * An type representing an object.
 */
export interface IObject<V = any> {
    [key: string]: V;
}

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
 * Search parameters object passed to the `url.params` property.
 */
export type SearchParams = URLSearchParams | Record<string, any> | string | null;

export type MethodsUpper = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
export type MethodsLower = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

export type Methods = MethodsUpper | MethodsLower;
export type RequestUrlPath = string;

/**
 * The execution manager for the request pipeline.
 */
export interface PipelineExecutorsManager {
    request?: PipelineExecutor<RequestExecutor>[];
    response?: PipelineExecutor<ResponseExecutor>[];
}

/**
 * The resolved callback when a request has been fulfilled.
 */
export type DispatchedResponse = Promise<UrbexResponse>;

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
     */
    data: D;
    /**
     * Set the default timeout to use for all requests.
     *
     * Defaults to 0 (no timeout).
     */
    timeout: number;
    /**
     * Control the internal ttl cache module. Provide a `ttl` value to enable the cache.
     *
     * See the [cache-clock](https://github.com/itsmichaelbtw/cache-clock)
     * documentation for more information.
     */
    cache: ClockOptions;
    /**
     * Custom pipeline transformers to use. These are executed in the order
     * they are provided and on each request.
     */
    pipelines: PipelineExecutorsManager;
}

/**
 * The underlying request api that powers the client.
 */
export interface UrbexRequestApi {
    send(config: InternalConfiguration): DispatchedResponse;
}
