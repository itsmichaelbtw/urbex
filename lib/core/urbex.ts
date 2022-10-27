import type {
    Methods,
    MethodsLower,
    MethodsUpper,
    RequestUrlPath
} from "../types";
import type {
    URIComponent,
    DispatchedResponse,
    ConfigurableClientUrl,
    ConfigurableUrbexClient,
    ParsedClientConfiguration,
    SafeParsedClientConfiguration
} from "./types";

import { RequestApi } from "./api/request-api";
import { RequestConfig } from "./request-config";
import {
    createPromise,
    deepMerge,
    merge,
    clone,
    isString,
    isObject,
    argumentIsNotProvided,
    hasOwnProperty,
    stringReplacer,
    ensureLeadingSlash,
    forEach,
    isUndefined,
    uppercase
} from "../utils";
import {
    convertStringToURIComponent,
    convertURIComponentToString,
    serializeParams
} from "./url";
import { METHODS } from "../constants";

type NullableRequestBody = Omit<ConfigurableUrbexClient, "data" | "url">;

export interface UrbexClient {
    /**
     * Send a GET request.
     */
    get(
        url: ConfigurableClientUrl,
        config?: NullableRequestBody
    ): DispatchedResponse;
    /**
     * Send a POST request.
     */
    post(
        url: ConfigurableClientUrl,
        data?: any,
        config?: NullableRequestBody
    ): DispatchedResponse;
    /**
     * Send a PUT request.
     */
    put(
        url: ConfigurableClientUrl,
        data?: any,
        config?: NullableRequestBody
    ): DispatchedResponse;
    /**
     * Send a PATCH request.
     */
    patch(
        url: ConfigurableClientUrl,
        data?: any,
        config?: NullableRequestBody
    ): DispatchedResponse;
    /**
     * Send a DELETE request.
     */
    delete(
        url: ConfigurableClientUrl,
        config?: NullableRequestBody
    ): DispatchedResponse;
    /**
     * Send a HEAD request.
     */
    head(
        url: ConfigurableClientUrl,
        config?: NullableRequestBody
    ): DispatchedResponse;
    /**
     * Send a OPTIONS request.
     */
    options(
        url: ConfigurableClientUrl,
        config?: NullableRequestBody
    ): DispatchedResponse;
}

function createMethodConfig(
    method: Methods,
    uri: ConfigurableClientUrl,
    config: ConfigurableUrbexClient
): ConfigurableUrbexClient {
    if (argumentIsNotProvided(uri)) {
        throw new Error(
            "Attempted to call a HTTP method without providing a URL. If you want to use the default URL, use `urbex.send` instead."
        );
    }

    return merge(config, { url: uri, method: method });
}

// function convertRequestPayload(data: any) {
//     if ()
// }

export class UrbexClient extends RequestApi {
    private $config: RequestConfig;
    private $interceptors = {};
    private $subscriptions = {};

    constructor(config?: ConfigurableUrbexClient) {
        super();

        this.$config = new RequestConfig(config);
    }

    /**
     *
     * Creates a new instance of the UrbexClient.
     */
    static create(config?: ConfigurableUrbexClient): UrbexClient {
        return new UrbexClient(config);
    }

    get config(): SafeParsedClientConfiguration {
        return this.$config.get();
    }

    /**
     * Configures the UrbexClient. You are free to call this method as
     * many times as you want. All configurations will be merged together.
     *
     * @param config The configuration to use.
     */
    public configure(config: ConfigurableUrbexClient): void {
        this.$config.set(config, false);
    }

    public send(config: ConfigurableUrbexClient = {}): DispatchedResponse {
        // convert to an internal config here
        // https://github.com/orison-networks/urbex/issues/4
        if (isString(config.url) && config.url.startsWith("/")) {
            config.url = {
                endpoint: config.url
            };
        }

        // temporary fix for: https://github.com/orison-networks/urbex/issues/6
        // will likely want to merge this with the uriParser if available
        const params = merge(
            // @ts-ignore
            this.config.params,
            serializeParams(config.params, "object")
        );

        const cfg = this.$config.merge(
            this.$config.parseIncomingConfig(
                merge(config, {
                    params
                }),
                true
            )
        );

        return this.dispatchRequest(cfg);
    }

    /**
     * When a response is received, the UrbexClient will actively push out the response to all active
     * subscriptions
     */
    public subscribe() {}
}

forEach(["delete", "get", "head", "options"], (_, value: MethodsLower) => {
    UrbexClient.prototype[value] = function (
        url: ConfigurableClientUrl,
        config?: NullableRequestBody
    ) {
        return this.send(createMethodConfig(uppercase(value), url, config));
    };
});

forEach(["post", "put", "patch"], (_, value: MethodsLower) => {
    UrbexClient.prototype[value] = function (
        url: ConfigurableClientUrl,
        data?: any,
        config?: NullableRequestBody
    ) {
        function combineIncomingConfig(): ConfigurableUrbexClient {
            if (!isUndefined(data)) {
                if (isObject(config)) {
                    return merge(config, { data: data });
                } else {
                    return { data };
                }
            }

            return config;
        }

        const cfg = combineIncomingConfig();

        return this.send(createMethodConfig(uppercase(value), url, cfg));
    };
});

export function isUrbexClient(client: unknown): client is UrbexClient {
    return client instanceof UrbexClient;
}
