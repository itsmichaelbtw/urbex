import type {
    URLProtocol,
    URIComponent,
    BaseURIComponent,
    ParsedClientConfiguration,
    ConfigurableUrbexClient,
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
        const headers = new UrbexHeaders();

        const cfg: ParsedClientConfiguration = {
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

    public parseIncomingConfig<T extends ConfigurableUrbexClient>(
        config: T,
        allowEndpoints: boolean
    ): ParsedClientConfiguration {
        if (argumentIsNotProvided(config) || !isObject(config)) {
            throw new Error(
                "The configuration must be an object with valid properties."
            );
        }

        const parsedConfiguration = merge<T, ParsedClientConfiguration>(
            config,
            {
                headers: UrbexHeaders.construct(config.headers)
            }
        );

        if (hasOwnProperty(parsedConfiguration, "params")) {
            parsedConfiguration.params = serializeParams(
                parsedConfiguration.params,
                "object"
            );
        }

        if (hasOwnProperty(parsedConfiguration, "url")) {
            if (isObject(parsedConfiguration.url)) {
                // have to merge otherwise the uri parser may
                // throw an error if fewer values are provided
                parsedConfiguration.url = merge(
                    this.get().url,
                    parsedConfiguration.url
                );
            }

            parsedConfiguration.url = uriParser(
                parsedConfiguration.url,
                parsedConfiguration.params,
                allowEndpoints
            );
        }

        if (hasOwnProperty(parsedConfiguration, "method")) {
            const method = uppercase(parsedConfiguration.method);

            if (!METHODS.includes(method)) {
                throw new Error(
                    `The method ${method} is not a valid HTTP method.`
                );
            }

            parsedConfiguration.method = method;
        }

        return parsedConfiguration;
    }

    public set(
        config: ConfigurableUrbexClient,
        allowEndpoints: boolean = false
    ): void {
        const cfg = this.parseIncomingConfig(config, allowEndpoints);

        if (cfg) {
            this.$config = this.merge(cfg);
        }
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

    /**
     * Merges a parsed configuration with the current configuration.
     * This does not set the configuration, but rather merges and returns it.
     *
     * Returns a new configuration object.
     */
    public merge(
        config?: ParsedClientConfiguration
    ): ParsedClientConfiguration {
        if (argumentIsNotProvided(config) || !isObject(config)) {
            return this.$config;
        }

        const currentConfig = this.get();
        const incomingConfig = this.toJSON(config);

        const merged = deepMerge(currentConfig, incomingConfig);
        const headersObject = UrbexHeaders.construct(merged.headers);

        return merge(merged, { headers: headersObject });
    }

    /**
     * Reset the configuration to its default state.
     */
    public reset() {}
}
