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
import { UrbexError, PipelineError } from "../error";

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

        try {
            await PipelineExecutor.process<InternalConfiguration, RequestExecutor>(
                config,
                config.pipelines.request
            );
        } catch (error) {
            const errorInstance: UrbexError = UrbexError.createFromError.call(PipelineError, error);
            errorInstance.config = config;
            return Promise.reject(errorInstance);
        }
    }

    return async function concludeRequest(result): Promise<DispatchedResponse> {
        const incomingResult: UrbexResponse = deepMerge(clonedResponse, {
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
            try {
                await PipelineExecutor.process<UrbexResponse, ResponseExecutor>(
                    incomingResult,
                    config.pipelines.response
                );
            } catch (error) {
                const errorInstance: UrbexError = UrbexError.createFromError.call(
                    PipelineError,
                    error
                );
                errorInstance.config = config;
                errorInstance.request = incomingResult.request;
                errorInstance.response = incomingResult.response;
                errorInstance.status = incomingResult.status;
                return Promise.reject(errorInstance);
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        incomingResult.duration = duration;
        return Promise.resolve(incomingResult);
    };
}
