import type {
    URLProtocol,
    URIComponent,
    BaseURIComponent,
    ParsedClientConfiguration,
    ConfigurableUrbexClient,
    ParsableRequestConfig,
    SafeParsedClientConfiguration,
    ConfigurableClientUrl
} from "./types";
import type { URIParserModifier } from "./url";

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
import { isValidURL, serializeParams, parseURIIntoComponent } from "./url";
import { PROTOCOL_REGEXP, HOSTNAME_REGEXP, METHODS } from "../constants";
import { DEFAULT_CLIENT_OPTIONS } from "./constants";

function determineAppropriateURI() {
    const uriOptions: BaseURIComponent = {
        protocol: "https",
        hostname: null,
        urlMount: "/api",
        endpoint: null,
        port: null,
        params: null
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

export class RequestConfig {
    private $config: ParsedClientConfiguration;

    constructor(config?: ConfigurableUrbexClient) {
        const uriComponent = parseURIIntoComponent(determineAppropriateURI());

        this.$config = merge(DEFAULT_CLIENT_OPTIONS, {
            url: uriComponent,
            headers: new UrbexHeaders()
        });

        if (isObject(config) && !isEmpty(config)) {
            this.set(this.createConfigurationObject(config, true));
        }

        this.$config.pipelines.request.unshift((config) => {
            return Promise.resolve(config);
        });
    }

    public defaultConfig(): ParsedClientConfiguration {
        return merge(DEFAULT_CLIENT_OPTIONS, {
            url: parseURIIntoComponent(determineAppropriateURI()),
            headers: new UrbexHeaders()
        });
    }

    public createConfigurationObject(
        config: ConfigurableUrbexClient,
        allowEndpoints: boolean
    ): ParsedClientConfiguration {
        const parsed = this.parseIncomingConfig(config, allowEndpoints);
        const merged = this.merge(parsed);

        return merged;
    }

    public parseIncomingConfig<T extends ConfigurableUrbexClient>(
        config: T,
        allowEndpoints: boolean
    ): ParsableRequestConfig {
        if (argumentIsNotProvided(config) || !isObject(config)) {
            throw new Error("The configuration must be an object with valid properties.");
        }

        const configuration = clone(config);

        if (hasOwnProperty(configuration, "url")) {
            const currentUrlConfig = this.get().url;

            if (isObject(configuration.url)) {
                // have to merge otherwise the uri parser may
                // throw an error if fewer values are provided
                configuration.url = merge(currentUrlConfig, configuration.url);
            }

            if (allowEndpoints && configuration.url.toString().startsWith("/")) {
                configuration.url = merge(currentUrlConfig, {
                    endpoint: configuration.url
                });
            }

            const parsed = parseURIIntoComponent(configuration.url, allowEndpoints);
            configuration.url = parsed;
        }

        if (hasOwnProperty(configuration, "method")) {
            const method = uppercase(configuration.method);

            if (!METHODS.includes(method)) {
                throw new Error(`The method ${method} is not a valid HTTP method.`);
            }

            configuration.method = method;
        }

        const headers = UrbexHeaders.construct(configuration.headers, true);
        delete configuration.headers;

        return merge<T, ParsableRequestConfig>(configuration, {
            headers: headers
        });
    }

    public set(config: ParsedClientConfiguration): ParsedClientConfiguration {
        this.$config = config;
        return config;
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

    public get(): SafeParsedClientConfiguration {
        return this.toJSON(this.$config);
    }

    /**
     * Convert a parsed configuration into a safe configuration.
     * This removes any properties that are not safe to expose.
     *
     * Returns a JSON object.
     */
    public toJSON(config?: ParsedClientConfiguration): SafeParsedClientConfiguration {
        if (argumentIsNotProvided(config) || !isObject(config)) {
            return this.get();
        }

        const headers = config.headers.get();

        return merge(config, { headers });
    }

    /**
     * Reset the configuration to its default state.
     */
    public reset() {}
}
