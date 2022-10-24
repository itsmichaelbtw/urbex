import http from "http";
import https from "https";
import url from "url";

import type {
    DispatchedResponse,
    UrbexRequestApi,
    InternalUrbexConfiguration
} from "../types";

import { createPromise } from "../../utils";

export class NodeRequest implements UrbexRequestApi {
    public send(config: InternalUrbexConfiguration): DispatchedResponse {
        return createPromise(() => {});
    }
}
