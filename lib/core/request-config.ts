import type {
    UrbexClientOptions,
    URLProtocol,
    URIComponent,
    InternalUrbexConfiguration,
    BaseURIComponent,
    InternalRequestConfig
} from "./types";

import { UrbexHeaders } from "./headers";
import { environment } from "../environment";
import {
    isObject,
    merge,
    deepMerge,
    clone,
    hasOwnProperty,
    isString,
    extractMatchFromRegExp,
    ensureLeadingSlash,
    uppercase,
    argumentIsNotProvided,
    isEmpty
} from "../utils";
import { isValidURL, serializeParams, uriParser } from "./url";
import { PROTOCOL_REGEXP, HOSTNAME_REGEXP, METHODS } from "../constants";

function determineAppropriateURI() {
    const uriOptions: BaseURIComponent = {
        protocol: "https",
        hostname: null,
        urlMount: "/api",
        endpoint: null,
        port: null
    };

    if (environment.isBrowser) {
        const { protocol, hostname, port } = window.location;

        Object.assign(uriOptions, {
            protocol: protocol.replace(":", "") as URLProtocol,
            hostname: hostname,
            port: port
        });
    } else if (environment.isNode) {
        Object.assign(uriOptions, {
            protocol: "http",
            hostname: "localhost",
            port: 3000
        });
    }

    return uriOptions;
}

function validateUriComponent(uri: URIComponent) {
    if (argumentIsNotProvided(uri)) {
        throw new Error("URI component is not provided.");
    }

    return uriParser(clone(uri));
}

export class RequestConfig {
    private $config: InternalRequestConfig;

    constructor(config?: UrbexClientOptions) {
        const headers = new UrbexHeaders();

        const cfg: InternalRequestConfig = {
            url: {},
            method: "GET",
            headers: headers,
            data: null,
            timeout: 0
        };

        const uriComponent = uriParser(determineAppropriateURI());

        this.$config = merge(cfg, { url: uriComponent });

        if (isObject(config) && !isEmpty(config)) {
            this.set(config);
        }
    }

    private defaultConfig() {}

    public validateURIComponent(uri: URIComponent): URIComponent {
        if (argumentIsNotProvided(uri)) {
            throw new Error("URI component is not provided.");
        }

        return validateUriComponent(uri);
    }

    public parseIncomingConfig<T extends UrbexClientOptions>(
        config: T,
        allowEndpoints: boolean
    ): T {
        if (argumentIsNotProvided(config) || !isObject(config)) {
            throw new Error(
                "The configuration must be an object with valid properties."
            );
        }

        const cfg: T = clone(config);

        if (hasOwnProperty(cfg, "headers")) {
            cfg.headers = this.$config.headers.normalize(cfg.headers);
        }

        if (
            (hasOwnProperty(cfg, "params") && isString(cfg.params)) ||
            cfg.params instanceof URLSearchParams
        ) {
            cfg.params = serializeParams(cfg.params, "object");
        }

        if (hasOwnProperty(cfg, "url")) {
            if (isObject(cfg.url)) {
                cfg.url = merge(this.get().url, cfg.url);
            }

            cfg.url = uriParser(cfg.url, cfg.params, allowEndpoints);
        }

        if (hasOwnProperty(cfg, "method")) {
            const method = uppercase(cfg.method);

            if (!METHODS.includes(method)) {
                throw new Error(
                    `The method ${method} is not a valid HTTP method.`
                );
            }

            cfg.method = method;
        }

        return cfg;
    }

    public set<T extends UrbexClientOptions>(
        config: T,
        allowEndpoints: boolean = false
    ): void {
        const cfg = this.parseIncomingConfig(config, allowEndpoints);

        if (cfg) {
            if (hasOwnProperty(cfg, "headers")) {
                this.$config.headers.set(cfg.headers);
                delete cfg.headers;
            }

            this.$config = merge(this.$config, cfg);
        }
    }

    public get(): InternalUrbexConfiguration {
        const headers = this.$config.headers.get();
        return merge(this.$config, { headers });
    }

    /**
     * Merge the current configuration with a provided configuration.
     * This does not set the configuration, but rather merges and returns it.
     */
    public merge(config?: UrbexClientOptions) {
        return deepMerge(this.get(), config);
    }

    /**
     * Reset the configuration to its default state.
     */
    public reset() {}
}
