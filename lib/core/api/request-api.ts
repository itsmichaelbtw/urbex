import type { UrbexContext } from "../../environment/environment";
import type { UrbexRequestApi } from "./types";

import { environment } from "../../environment";
import { NodeRequest } from "./http";
import { BrowserRequest } from "./xhr";

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
            `Urbex expected a valid context to register a request api, but got ${context}`
        );
    }

    protected send() {}
}
