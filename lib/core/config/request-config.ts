import type { Methods, RequestUrlPath } from "../../types";
import type { BaseUrbexHeaders } from "../headers";

import { UrbexHeaders } from "../headers";
import { isObject, isUndefined, merge, deepMerge } from "../../utils";

type URI = URIOptions | RequestUrlPath;
type URLProtocol = "http" | "https";

interface URIOptions {
    /**
     * The transport protocol to use. Defaults to `https://`.
     */
    protocol?: URLProtocol;
    /**
     * The subdomain prefix that is attached to the active domain. Passing a
     * full domain will extract the subdomain if one is found.
     */
    nsubdomai?: string;
    /**
     * The domain name to use. If the domain is not specified, the current domain
     * will be used. If `environment.isNode` is `true`, then localhost is used.
     *
     * Only the domain and tld are extracted when a domain is passed.
     *
     * E.g. if
     * the domain is `https://www.example.com/api/v1`, then the domain will be `example.com`.
     */
    domain: string;
    /**
     * If you are making a request that has an api mounted at a different url path, you
     * can set it here. This is designed to remove the cumbersome task of specifying the full
     * url path for each request.
     *
     * E.g. if you are making a request to https://example.com/api/v1, you can set the url to
     * /api/v1 and all requests will be made to that url.
     */
    urlMount?: string;
    /**
     * The port to use. By default, no port is used.
     */
    port?: number | string;
}

export interface UrbexClientConfig {
    url?: URI;
    method?: Methods;
    headers?: BaseUrbexHeaders;
    params?: any;
    data?: any;
}

type RequestConfigOptions = Omit<UrbexClientConfig, "headers"> & {
    headers?: UrbexHeaders;
};

// set defaults for the url
// set defaults for the method
// set defaults for the headers

// turn into an object. Do not use a class

export class RequestConfig {
    private $config: RequestConfigOptions;

    constructor(config?: UrbexClientConfig) {
        this.ensureDefaults();
        this.set(config);
    }

    private ensureDefaults(): void {
        const headers = new UrbexHeaders();

        const config: RequestConfigOptions = {
            url: "",
            method: "GET",
            headers: headers
        };

        this.$config = config;
    }

    set<T extends UrbexClientConfig>(config?: T): void {
        if (isUndefined(config) || !isObject(config)) {
            return;
        }

        this.$config = deepMerge(this.$config, config);
    }

    get(): UrbexClientConfig {
        const headers = this.$config.headers.get();
        return merge(this.$config, { headers });
    }

    merge() {}

    reset() {}

    clear() {}
}
