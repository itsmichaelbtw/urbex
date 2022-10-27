import type { UrbexContext } from "../../environment/environment";
import type {
    DispatchedResponse,
    ParsedClientConfiguration,
    UrbexRequestApi
} from "../types";

import { NodeRequest } from "./http";
import { BrowserRequest } from "./xhr";
import { environment } from "../../environment";
import { UrbexHeaders } from "../headers";
import {
    createPromise,
    replaceObjectProperty,
    isEmpty,
    isObject,
    merge
} from "../../utils";
import { convertURIComponentToString } from "../url";

// here all of the interceptors are checked
// cache clocks are checked here
// the response is created here

export class RequestApi {
    protected $api: UrbexRequestApi = null;

    constructor() {
        this.register(environment.context);
    }

    private register(context: UrbexContext) {
        if (context === "browser" && typeof XMLHttpRequest !== "undefined") {
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

    protected async dispatchRequest(
        config: ParsedClientConfiguration
    ): DispatchedResponse {
        return this.$api.send(config);
    }
}
