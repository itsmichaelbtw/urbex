import type {
    DispatchedResponse,
    UrbexRequestApi,
    InternalUrbexConfiguration
} from "../types";

import { createPromise } from "../../utils";

export class BrowserRequest implements UrbexRequestApi {
    public send(config: InternalUrbexConfiguration): DispatchedResponse {
        return createPromise(() => {});
    }
}
