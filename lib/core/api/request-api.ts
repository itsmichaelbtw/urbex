import { CacheClock } from "cache-clock";

import type { UrbexContext } from "../../environment";
import type { InternalConfiguration } from "../../exportable-types";
import type { DispatchedResponse, UrbexRequestApi } from "../../types";

import { NodeRequest } from "./http";
import { BrowserRequest } from "./xhr";
import { environment } from "../../environment";
import { UrbexHeaders } from "../headers";
import { createPromise, replaceObjectProperty, isEmpty, isObject, merge } from "../../utils";
import { convertURIComponentToString } from "../url";

// here all of the interceptors are checked
// cache clocks are checked here
// the response is created here

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
        console.log(config);

        return this.$api.send(config);
    }
}
