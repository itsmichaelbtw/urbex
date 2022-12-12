import type { InternalConfiguration, UrbexConfig, UrbexURL } from "../exportable-types";

import { UrbexHeaders } from "./headers";
import { transformRequestData, transformResponseData, decodeResponseData } from "./transformers";
import { environment } from "../environment";
import { URLParser } from "./parsers/url-parser";
import {
    isObject,
    merge,
    deepMerge,
    clone,
    deepClone,
    hasOwnProperty,
    isString,
    extractMatchFromRegExp,
    uppercase,
    argumentIsNotProvided,
    isEmpty,
    isFunction
} from "../utils";
import { METHODS } from "./constants";
import {
    DEFAULT_CLIENT_OPTIONS,
    DEFAULT_PIPELINE_EXECUTORS,
    DEFAULT_URL_COMPONENT
} from "./constants";

function isPathname(pathname: string): boolean {
    if (!pathname.startsWith("//") && pathname.startsWith("/")) {
        return true;
    }

    return false;
}

function manageURLComponent(this: URLParser, component: UrbexURL, allowEndpoints: boolean): void {
    if (isString(component)) {
        const hasPathname = isPathname(component);

        if (hasPathname) {
            if (allowEndpoints) {
                this.pathname = component;
            } else {
                throw new Error(
                    "A valid URL string in the format of <scheme>://<hostname> must be passed when using `urbex.configure()`."
                );
            }
        } else {
            this.parse(component);
        }
    } else {
        // the serializer always uses the origin if passed
        // however this conflicts if the configuration method
        // is called multiple times attempting to change
        // components of the URL. By default, the origin will always
        // be present since it was parsed previously and will fail to
        // adjust the other components.

        // to fix this, if the origin is not passed, we will
        // set it to an empty string so that the serializer
        // will not use it.

        if (component.origin === undefined) {
            component.origin = "";
        }

        component.href ? this.parse(component.href) : this.set(component).serialize(this.toJSON());
    }
}

export class RequestConfig {
    private $config: InternalConfiguration;

    constructor(config?: UrbexConfig) {
        this.setup();

        if (isObject(config) && !isEmpty(config)) {
            this.set(this.createConfigurationObject(config, true));
        }
    }

    private setup(): void {
        const envComponent = environment.getEnvironmentComponent();

        const pipelines = deepClone(DEFAULT_PIPELINE_EXECUTORS);

        pipelines.request.push(transformRequestData);
        pipelines.response.push(transformResponseData);

        if (environment.isNode) {
            pipelines.response.unshift(decodeResponseData);
        }

        const configuration = deepMerge(DEFAULT_CLIENT_OPTIONS, {
            url: envComponent,
            headers: new UrbexHeaders(),
            pipelines: pipelines
        });

        this.set(configuration);
    }

    public defaultConfig(): InternalConfiguration {
        return merge(DEFAULT_CLIENT_OPTIONS, {
            url: {},
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

        if (isEmpty(config)) {
            return {};
        }

        const currentConfig = this.get();
        const configuration = clone(config);

        const clonedUrl = clone(currentConfig.url.toJSON());
        const parser = new URLParser();

        parser.set(clonedUrl);

        if (hasOwnProperty(configuration, "url")) {
            const url = configuration.url;

            if (!isString(url) && !isObject(url)) {
                throw new Error("The url property must be a string or an object.");
            }

            manageURLComponent.call(parser, url, allowEndpoints);
        }

        if (hasOwnProperty(configuration, "method")) {
            const method = uppercase(configuration.method);

            if (!METHODS.includes(method)) {
                throw new Error(`The method ${method} is not a valid HTTP method.`);
            }

            configuration.method = method;
        }

        const timeout = parseInt(configuration.timeout?.toString(), 10);

        if (isNaN(timeout)) {
            configuration.timeout = DEFAULT_CLIENT_OPTIONS.timeout;
        }

        const maxContentLength = parseInt(configuration.maxContentLength?.toString(), 10);

        if (isNaN(maxContentLength)) {
            configuration.maxContentLength = DEFAULT_CLIENT_OPTIONS.maxContentLength;
        }

        if (!isFunction(config.resolveStatus)) {
            config.resolveStatus = DEFAULT_CLIENT_OPTIONS.resolveStatus;
        }

        const headers = UrbexHeaders.construct(configuration.headers, true);

        delete configuration.headers;
        delete configuration.url;

        return merge<UrbexConfig, Partial<InternalConfiguration>>(configuration, {
            headers: headers,
            url: parser
        });
    }

    public set(config: InternalConfiguration): InternalConfiguration {
        this.$config = config;
        return config;
    }

    public merge(
        config?: InternalConfiguration | Partial<InternalConfiguration>
    ): InternalConfiguration {
        if (argumentIsNotProvided(config) || !isObject(config) || isEmpty(config)) {
            return this.get();
        }

        const currentConfig = this.get();
        const incomingHeaders = config.headers?.get() ?? {};
        const incomingComponent = config.url?.toJSON() ?? {};

        const mergedHeaders = merge(currentConfig.headers.get(), incomingHeaders);
        const mergedComponent = merge(currentConfig.url.toJSON(), incomingComponent);

        delete config.headers;
        delete config.url;

        const merged = deepMerge(currentConfig, config);

        const headersObject = UrbexHeaders.construct(mergedHeaders);
        const componentObject = new URLParser();

        componentObject.set(mergedComponent);

        return merge<InternalConfiguration, Partial<InternalConfiguration>>(merged, {
            headers: headersObject,
            url: componentObject
        });
    }

    public get(): InternalConfiguration {
        return this.$config;
    }

    /**
     * Reset the configuration to its default state.
     */
    public reset() {
        this.setup();
    }
}
