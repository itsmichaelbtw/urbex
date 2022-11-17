import type {
    URLProtocol,
    URIComponent,
    BaseURIComponent,
    ParsedClientConfiguration,
    ConfigurableUrbexClient,
    ParsableRequestConfig,
    SafeParsedClientConfiguration
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
import { DEFAULT_CLIENT_OPTIONS } from "./constants";

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
            protocol: protocol.replace(":", ""),
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
    private $config: ParsedClientConfiguration;

    constructor(config?: ConfigurableUrbexClient) {
        const uriComponent = uriParser(determineAppropriateURI());

        this.$config = merge(DEFAULT_CLIENT_OPTIONS, {
            url: uriComponent,
            headers: new UrbexHeaders()
        });

        if (isObject(config) && !isEmpty(config)) {
            this.set(config);
        }
    }

    public defaultConfig(): ParsedClientConfiguration {
        return merge(DEFAULT_CLIENT_OPTIONS, {
            url: uriParser(determineAppropriateURI()),
            headers: new UrbexHeaders()
        });
    }

    public validateURIComponent(uri: URIComponent): URIComponent {
        if (argumentIsNotProvided(uri)) {
            throw new Error("URI component is not provided.");
        }

        return validateUriComponent(uri);
    }

    public parseIncomingConfig<T extends ConfigurableUrbexClient>(
        config: T,
        allowEndpoints: boolean
    ): ParsableRequestConfig {
        if (argumentIsNotProvided(config) || !isObject(config)) {
            throw new Error(
                "The configuration must be an object with valid properties."
            );
        }

        const configuration = clone(config);

        if (hasOwnProperty(configuration, "params")) {
            configuration.params = serializeParams(
                configuration.params,
                "object"
            );
        }

        if (hasOwnProperty(configuration, "url")) {
            if (isObject(configuration.url)) {
                // have to merge otherwise the uri parser may
                // throw an error if fewer values are provided
                configuration.url = merge(this.get().url, configuration.url);
            }

            configuration.url = uriParser(
                configuration.url,
                configuration.params,
                allowEndpoints
            );
        }

        if (hasOwnProperty(configuration, "method")) {
            const method = uppercase(configuration.method);

            if (!METHODS.includes(method)) {
                throw new Error(
                    `The method ${method} is not a valid HTTP method.`
                );
            }

            configuration.method = method;
        }

        const headers = UrbexHeaders.construct(configuration.headers, true);
        delete configuration.headers;

        return merge<T, ParsableRequestConfig>(configuration, {
            headers: headers
        });
    }

    public set<T extends ConfigurableUrbexClient>(
        config: T,
        allowEndpoints: boolean = false
    ): ParsedClientConfiguration {
        const configuration = this.parseIncomingConfig(config, allowEndpoints);
        const merged = this.merge(configuration);

        this.$config = merged;

        return merged;
    }

    /**
     * Convert a parsed configuration into a safe configuration.
     * This removes any properties that are not safe to expose.
     *
     * Returns a JSON object.
     */
    public toJSON(
        config?: ParsedClientConfiguration
    ): SafeParsedClientConfiguration {
        if (argumentIsNotProvided(config) || !isObject(config)) {
            return this.get();
        }

        const headers = config.headers.get();

        return merge(config, { headers });
    }

    public get(): SafeParsedClientConfiguration {
        return this.toJSON(this.$config);
    }

    public merge(config?: ParsableRequestConfig): ParsedClientConfiguration {
        if (argumentIsNotProvided(config) || !isObject(config)) {
            return this.$config;
        }

        const currentConfig = this.get();
        const incomingHeaders = config.headers.get();

        const mergedHeaders = merge(currentConfig.headers, incomingHeaders);

        delete config.headers;

        const merged = deepMerge(currentConfig, config);
        const headersObject = UrbexHeaders.construct(mergedHeaders);

        return merge(merged, { headers: headersObject });
    }

    /**
     * Reset the configuration to its default state.
     */
    public reset() {}
}
