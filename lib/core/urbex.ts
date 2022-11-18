import type { CacheClock } from "cache-clock";
import type {
    Methods,
    MethodsLower,
    MethodsUpper,
    RequestUrlPath,
    DispatchedResponse,
    PipelineExecutorsManager
} from "../types";
import type { UrbexURL, UrbexConfig, InternalConfiguration } from "../exportable-types";

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
    uppercase,
    isEmpty
} from "../utils";
import { convertURIComponentToString, serializeParams } from "./url";
import { METHODS } from "../constants";

type UrbexDirectRequest = Omit<UrbexConfig, "data" | "url" | "cache">;

export interface UrbexClient {
    /**
     * Send a GET request.
     */
    get(url: UrbexURL, config?: UrbexDirectRequest): DispatchedResponse;
    /**
     * Send a POST request.
     */
    post(url: UrbexURL, data?: any, config?: UrbexDirectRequest): DispatchedResponse;
    /**
     * Send a PUT request.
     */
    put(url: UrbexURL, data?: any, config?: UrbexDirectRequest): DispatchedResponse;
    /**
     * Send a PATCH request.
     */
    patch(url: UrbexURL, data?: any, config?: UrbexDirectRequest): DispatchedResponse;
    /**
     * Send a DELETE request.
     */
    delete(url: UrbexURL, config?: UrbexDirectRequest): DispatchedResponse;
    /**
     * Send a HEAD request.
     */
    head(url: UrbexURL, config?: UrbexDirectRequest): DispatchedResponse;
    /**
     * Send a OPTIONS request.
     */
    options(url: UrbexURL, config?: UrbexDirectRequest): DispatchedResponse;
}

function createMethodConfig(method: Methods, uri: UrbexURL, config: UrbexConfig): UrbexConfig {
    if (argumentIsNotProvided(uri)) {
        throw new Error(
            "Attempted to call a HTTP method without providing a URL. If you want to use the default URL, use `urbex.send` instead."
        );
    }

    return merge(config, { url: uri, method: method });
}

export class UrbexClient extends RequestApi {
    private $config: RequestConfig;
    private $pipelines: PipelineExecutorsManager = {
        request: [],
        response: []
    };

    constructor(config?: UrbexConfig) {
        super();

        this.$config = new RequestConfig(config);
    }

    /**
     *
     * Creates a new instance of the UrbexClient.
     */
    static create(config?: UrbexConfig): UrbexClient {
        return new UrbexClient(config);
    }

    /**
     * Current, and most up-to-date configuration of the UrbexClient.
     */
    get config(): InternalConfiguration {
        return this.$config.get();
    }

    /**
     * The internal cache module.
     */
    get cache(): CacheClock {
        return this.$cache;
    }

    /**
     * Configures the UrbexClient. You are free to call this method as
     * many times as you want. All configurations will be merged together.
     *
     * @param config The configuration to use.
     */
    public configure(config: UrbexConfig): void {
        const configuration = this.$config.createConfigurationObject(config, false);
        this.$config.set(configuration);

        if (isEmpty(configuration.cache)) {
            if (this.$cache) {
                this.$cache.clear();

                if (this.$cache.isRunning) {
                    this.$cache.stop();
                }
            }
        } else {
            this.$cache.configure(configuration.cache);

            if (!this.$cache.isRunning) {
                this.$cache.start();
            }
        }
    }

    public send(config: UrbexConfig = {}): DispatchedResponse {
        const configuration = this.$config.parseIncomingConfig(config, true);
        const merged = this.$config.merge(configuration);

        return this.dispatchRequest(merged);
    }

    /**
     * Inject pipelines into the UrbexClient. This allows you to add custom logic to the request/response
     */
    public injectPipeline(): void {}

    /**
     * Eject a pipeline from the UrbexClient.
     */
    public ejectPipeline(): void {}

    /**
     * When a response is received, the UrbexClient will actively push out the response to all active
     * subscriptions
     */
    public subscribe() {}

    public unsubscribe(): void {}
}

forEach(["delete", "get", "head", "options"], (_, value: MethodsLower) => {
    UrbexClient.prototype[value] = function (url: UrbexURL, config?: UrbexDirectRequest) {
        return this.send(createMethodConfig(uppercase(value), url, config));
    };
});

forEach(["post", "put", "patch"], (_, value: MethodsLower) => {
    UrbexClient.prototype[value] = function (
        url: UrbexURL,
        data?: any,
        config?: UrbexDirectRequest
    ) {
        function combineIncomingConfig(): UrbexConfig {
            if (isUndefined(data)) {
                return data;
            }

            if (isObject(config)) {
                return merge(config, { data: data });
            } else {
                return { data };
            }
        }

        const configuration = combineIncomingConfig();

        return this.send(createMethodConfig(uppercase(value), url, configuration));
    };
});

export function isUrbexClient(client: unknown): client is UrbexClient {
    return client instanceof UrbexClient;
}
