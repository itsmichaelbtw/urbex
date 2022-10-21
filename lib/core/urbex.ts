import type { Methods, MethodsUpper, RequestUrlPath } from "../types";
import type {
    UrbexClientOptions,
    URIComponent,
    DispatchedResponse,
    UrbexURL,
    PassableConfig,
    InternalUrbexConfiguration
} from "./types";

import { RequestApi } from "./api/request-api";
import { RequestConfig } from "./config/request-config";
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

type NullableRequestBody = Omit<PassableConfig, "data">;

export interface UrbexClient {
    /**
     * Send a GET request.
     */
    get(url: UrbexURL, config?: NullableRequestBody): DispatchedResponse;
    /**
     * Send a POST request.
     */
    post(
        url: UrbexURL,
        data?: any,
        config?: NullableRequestBody
    ): DispatchedResponse;
    /**
     * Send a PUT request.
     */
    put(
        url: UrbexURL,
        data?: any,
        config?: NullableRequestBody
    ): DispatchedResponse;
    /**
     * Send a PATCH request.
     */
    patch(
        url: UrbexURL,
        data?: any,
        config?: NullableRequestBody
    ): DispatchedResponse;
    /**
     * Send a DELETE request.
     */
    delete(url: UrbexURL, config?: NullableRequestBody): DispatchedResponse;
    /**
     * Send a HEAD request.
     */
    head(url: UrbexURL, config?: NullableRequestBody): DispatchedResponse;
    /**
     * Send a OPTIONS request.
     */
    options(url: UrbexURL, config?: NullableRequestBody): DispatchedResponse;
}

export class UrbexClient extends RequestApi {
    private $config: RequestConfig;
    private $interceptors = {};
    private $subscriptions = {};

    constructor(config?: UrbexClientOptions) {
        super();

        this.$config = new RequestConfig(config);
    }

    /**
     *
     * Creates a new instance of the UrbexClient.
     */
    static create(config?: UrbexClientOptions): UrbexClient {
        return new UrbexClient(config);
    }

    private createMethodConfig(
        method: Methods,
        uri: UrbexURL,
        config: PassableConfig
    ): UrbexClientOptions {
        if (argumentIsNotProvided(uri)) {
            throw new Error(
                "Attempted to call a HTTP method without providing a URL. If you want to use the default URL, use `urbex.send` instead."
            );
        }

        return merge(config, { url: uri, method: method });
    }

    get config(): Readonly<InternalUrbexConfiguration> {
        return this.$config.get();
    }

    /**
     * Configures the UrbexClient. You are free to call this method as
     * many times as you want. All configurations will be merged together.
     *
     *
     * @param config The configuration to use.
     */
    public configure(config: UrbexClientOptions): void {
        this.$config.set(config, false);
    }

    public send(config?: UrbexClientOptions): DispatchedResponse {
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
        ) as InternalUrbexConfiguration;

        console.log(cfg);

        return this.dispatchRequest(cfg);
    }

    /**
     * When a response is received, the UrbexClient will actively push out the response to all active
     * subscriptions
     */
    public subscribe() {}
}

forEach(["delete", "get", "head", "options"], (_, value: MethodsUpper) => {
    UrbexClient.prototype[value] = function (
        url: UrbexURL,
        config?: NullableRequestBody
    ) {
        return this.send(
            this.createMethodConfig(uppercase(value), url, config)
        );
    };
});

forEach(["post", "put", "patch"], (_, value: MethodsUpper) => {
    UrbexClient.prototype[value] = function (
        url: UrbexURL,
        data?: any,
        config?: NullableRequestBody
    ) {
        function combineIncomingConfig(): PassableConfig {
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

        return this.send(this.createMethodConfig(uppercase(value), url, cfg));
    };
});

export function isUrbexClient(client: unknown): client is UrbexClient {
    return client instanceof UrbexClient;
}
