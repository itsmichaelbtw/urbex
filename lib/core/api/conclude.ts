import type {
    InternalConfiguration,
    UrbexResponse,
    RequestExecutor,
    ResponseExecutor
} from "../../exportable-types";
import type { DispatchedResponse, RequestAPIResponse } from "../../types";

import { PipelineExecutor } from "../pipelines";
import { deepMerge, isEmpty, deepClone, mutate } from "../../utils";
import { DEFAULT_URBEX_RESPONSE } from "../constants";
import { environment } from "../../environment";
import { UrbexHeaders } from "../../core/headers";

type ConcludeRequest = (config: RequestAPIResponse) => Promise<DispatchedResponse>;

export async function startRequest(config: InternalConfiguration): Promise<ConcludeRequest> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const clonedResponse = deepClone(DEFAULT_URBEX_RESPONSE);

    if (!isEmpty(config.pipelines.request)) {
        // loop over the request pipelines
        // each pipeline is a Promise that returns a new config
        // each new config is passed to the next pipeline
        // the very last config will mutate the `config` parameter

        await PipelineExecutor.process(config, config.pipelines.request);
    }

    return async function concludeRequest(result): Promise<DispatchedResponse> {
        const incomingResult = deepMerge(clonedResponse, {
            data: result.data,
            config: config,
            request: result.request || {},
            response: result.response || {},
            timestamp: timestamp,
            responseType: config.responseType,
            cache: result.cache || {}
        });

        if (incomingResult.cache && incomingResult.cache.hit) {
            const statusCode = 200;
            const statusText = "Pulled from internal cache.";

            if (environment.isNode) {
                incomingResult.response.statusCode = statusCode;
                incomingResult.response.statusMessage = statusText;
            } else {
                incomingResult.response.status = statusCode;
                incomingResult.response.statusText = statusText;
            }
        }

        if (incomingResult.response) {
            incomingResult.headers = incomingResult.response.headers;

            if (environment.isNode) {
                incomingResult.status = incomingResult.response.statusCode;
                incomingResult.statusText = incomingResult.response.statusMessage;
            } else {
                const parsedHeaders = UrbexHeaders.parse(incomingResult.headers);

                incomingResult.headers = parsedHeaders;

                incomingResult.status = incomingResult.response.status;
                incomingResult.statusText = incomingResult.response.statusText;
            }
        }

        if (!isEmpty(config.pipelines.response)) {
            await PipelineExecutor.process(incomingResult, config.pipelines.response);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        incomingResult.duration = duration;
        return Promise.resolve(incomingResult);
    };
}
