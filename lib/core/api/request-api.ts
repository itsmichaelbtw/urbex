import { CacheClock } from "cache-clock";

import type { UrbexContext } from "../../environment";
import type { InternalConfiguration, UrbexResponse } from "../../exportable-types";
import type { DispatchedResponse, UrbexRequestApi } from "../../types";

import { NodeRequest } from "./http";
import { BrowserRequest } from "./xhr";
import { startRequest } from "./conclude";
import { environment } from "../../environment";
import { UrbexError } from "../error";
import { deepClone, isUndefined } from "../../utils";

export class RequestApi {
    /**
     * The internal api that is used to send requests.
     */
    protected $api: UrbexRequestApi;
    /**
     * An isolated cache module that is used to cache requests.
     */
    protected $cache: CacheClock;

    constructor() {
        this.register(environment.context);

        this.$cache = new CacheClock({
            autoStart: false,
            debug: false
        });
    }

    private register(context: UrbexContext) {
        if (context === "browser") {
            this.$api = new BrowserRequest();
            return;
        }

        if (context === "node") {
            this.$api = new NodeRequest();
            return;
        }

        throw new Error(
            `Urbex expected a valid context to register a request api, but got ${context}.`
        );
    }

    protected async dispatchRequest(config: InternalConfiguration): DispatchedResponse {
        try {
            const configuration = deepClone(config);
            const concludeRequest = await startRequest(configuration);

            const isCacheEnabled = configuration.cache && configuration.cache.enabled;

            // for some odd reason, result.cache had this weird mutation
            // issue even when CLONING the result, so I had to do this
            // to get it to work properly

            // solved: the clone function that is internally provided
            // only shallow clones the object, so the cache object
            // was being mutated. It is now deep cloned.

            if (isCacheEnabled) {
                const cacheKey = this.$cache.getCacheKey(configuration.url.href);
                const entity = this.$cache.get(cacheKey, true);

                if (entity) {
                    const result = await concludeRequest({
                        data: entity.v,
                        request: null,
                        response: null,
                        cache: {
                            key: cacheKey,
                            pulled: true,
                            hit: true,
                            stored: false
                        }
                    });

                    return Promise.resolve(result);
                }
            }

            const response = await this.$api.send(configuration);
            const result = await concludeRequest(response);

            if (isCacheEnabled && !isUndefined(result.data)) {
                this.$cache.set(configuration.url.href, result.data);

                result.cache.key = this.$cache.getCacheKey(configuration.url.href);
                result.cache.stored = true;
            }

            result.cache.hit = isCacheEnabled;

            return Promise.resolve(result);
        } catch (error: any) {
            if (UrbexError.isInstance(error)) {
                return Promise.reject(error);
            }

            const internalError = UrbexError.create(config);
            internalError.message = error.message;
            return Promise.reject(internalError);
        }
    }
}
