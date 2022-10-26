import type {
    DispatchedResponse,
    UrbexRequestApi,
    ParsedClientConfiguration
} from "../types";

import { createPromise } from "../../utils";

export class BrowserRequest implements UrbexRequestApi {
    public send(config: ParsedClientConfiguration): DispatchedResponse {
        return createPromise(() => {});
    }
}
