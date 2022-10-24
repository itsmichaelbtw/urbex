import type { UrbexContext } from "../../environment/environment";
import type {
    UrbexRequestApi,
    DispatchedResponse,
    UrbexClientOptions,
    InternalUrbexConfiguration
} from "../types";

import { NodeRequest } from "./http";
import { BrowserRequest } from "./xhr";
import { environment } from "../../environment";
import { createPromise } from "../../utils";
import { convertURIComponentToString, URLStringBuilder } from "../url";

export class RequestApi {
    protected $api: UrbexRequestApi = null;

    constructor() {
        this.register(environment.context);
    }

    private register(context: UrbexContext) {
        if (context === "browser" && typeof XMLHttpRequest !== "undefined") {
            // this.$api = new BrowserRequest();
            return;
        }

        if (context === "node") {
            // this.$api = new NodeRequest();
            return;
        }

        throw new Error(
            `Urbex expected a valid context to register a request api, but got ${context}.`
        );
    }

    // this intakes an internal config object
    protected dispatchRequest(
        config: InternalUrbexConfiguration
    ): DispatchedResponse {
        // only thing we have to do here is build the url
        // this shouldn't be responsible for validating the config object
        // will need to check the cache, not sure whether to perform
        // this op here or before this method is called

        const targetURL = config.url.href;

        console.log(config);

        return createPromise((resolve, reject) => {
            // this.$api.send().then(resolve).catch(reject)
        });
    }
}
