import type { RequestUrlPath } from "../types";
import type { UrbexClientConfig } from "./config/request-config";

import { RequestApi } from "./api/request-api";
import { RequestConfig } from "./config/request-config";

export class UrbexClient extends RequestApi {
    private $config: RequestConfig;
    private $interceptors = {};
    private $subscriptions = {};

    constructor(config?: UrbexClientConfig) {
        super();

        this.$config = new RequestConfig(config);
    }

    /**
     *
     * Creates a new instance of the UrbexClient.
     */
    static create(): UrbexClient {
        return new UrbexClient();
    }

    get config(): UrbexClientConfig {
        return this.$config.get();
    }

    /**
     * Configures the UrbexClient.
     *
     * @param config The configuration to use.
     */
    public configure(config: UrbexClientConfig): void {
        this.$config.set(config);
    }

    public get() {}

    public post() {}

    public put() {}

    public patch() {}

    public delete() {}

    public head() {}

    public options() {}
}

export function isUrbexClient(client: unknown): client is UrbexClient {
    return client instanceof UrbexClient;
}
