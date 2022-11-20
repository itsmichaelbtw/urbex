import type { InternalConfiguration, UrbexConfig, URIComponent } from "../exportable-types";

import { UrbexHeaders } from "./headers";
import { transformRequestData, transformResponseData, decodeResponseData } from "./transformers";
import { environment } from "../environment";
import {
    isObject,
    merge,
    deepMerge,
    clone,
    hasOwnProperty,
    isString,
    extractMatchFromRegExp,
    uppercase,
    argumentIsNotProvided,
    isEmpty
} from "../utils";
import { isValidURL, serializeParams, parseURIIntoComponent } from "./url";
import { PROTOCOL_REGEXP, HOSTNAME_REGEXP, METHODS } from "../constants";
import { DEFAULT_CLIENT_OPTIONS, DEFAULT_URI_COMPONENT } from "./constants";

function determineAppropriateURI(): URIComponent {
    const component = merge(DEFAULT_URI_COMPONENT, {
        protocol: "https",
        urlMount: "/api"
    });

    if (environment.isBrowser) {
        const { protocol, hostname, port } = window.location;

        Object.assign(component, {
            protocol: protocol.replace(":", ""),
            hostname: hostname,
            port: port
        });
    } else if (environment.isNode) {
        Object.assign(component, {
            protocol: "http",
            hostname: "localhost",
            port: 3000
        });
    }

    return component;
}

export class RequestConfig {
    private $config: InternalConfiguration;

    constructor(config?: UrbexConfig) {
        const component = parseURIIntoComponent(determineAppropriateURI());

        this.$config = merge(DEFAULT_CLIENT_OPTIONS, {
            url: component,
            headers: new UrbexHeaders()
        });

        if (isObject(config) && !isEmpty(config)) {
            this.set(this.createConfigurationObject(config, true));
        }

        this.$config.pipelines.request.unshift(transformRequestData);

        if (environment.isNode) {
            this.$config.pipelines.response.unshift(decodeResponseData, transformResponseData);
        }
    }

    public defaultConfig(): InternalConfiguration {
        return merge(DEFAULT_CLIENT_OPTIONS, {
            url: parseURIIntoComponent(determineAppropriateURI()),
            headers: new UrbexHeaders()
        });
    }

    public createConfigurationObject(
        config: UrbexConfig,
        allowEndpoints: boolean
    ): InternalConfiguration {
        const parsed = this.parseIncomingConfig(config, allowEndpoints);
        const merged = this.merge(parsed);

        return merged;
    }

    public parseIncomingConfig(
        config: UrbexConfig,
        allowEndpoints: boolean
    ): Partial<InternalConfiguration> {
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

        const timeout = parseInt(
            configuration.timeout?.toString() ?? DEFAULT_CLIENT_OPTIONS.timeout.toString()
        );

        if (isNaN(timeout)) {
            configuration.timeout = DEFAULT_CLIENT_OPTIONS.timeout;
        }

        const maxContentLength = parseInt(
            configuration.maxContentLength?.toString() ??
                DEFAULT_CLIENT_OPTIONS.maxContentLength.toString()
        );

        if (isNaN(maxContentLength)) {
            configuration.maxContentLength = DEFAULT_CLIENT_OPTIONS.maxContentLength;
        }

        const headers = UrbexHeaders.construct(configuration.headers, true);
        delete configuration.headers;

        return merge<UrbexConfig>(configuration, {
            headers: headers
        });
    }

    public set(config: InternalConfiguration): InternalConfiguration {
        this.$config = config;
        return config;
    }

    public merge(
        config?: InternalConfiguration | Partial<InternalConfiguration>
    ): InternalConfiguration {
        if (argumentIsNotProvided(config) || !isObject(config)) {
            return this.get();
        }

        const currentConfig = this.get();
        const incomingHeaders = config.headers?.get() ?? {};

        const mergedHeaders = merge(currentConfig.headers, incomingHeaders);

        delete config.headers;

        const merged = deepMerge(currentConfig, config);
        const headersObject = UrbexHeaders.construct(mergedHeaders);

        return merge(merged, { headers: headersObject });
    }

    public get(): InternalConfiguration {
        return this.$config;
    }

    /**
     * Reset the configuration to its default state.
     */
    public reset() {}
}
