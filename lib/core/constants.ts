import type { InternalConfiguration, URIComponent, UrbexResponse } from "../exportable-types";
import type { PipelineExecutorsManager } from "../types";

import { merge, createEmptyScheme } from "../utils";

export const DEFAULT_HEADERS = {
    "Content-Type": "application/json"
};

export const DEFAULT_URI_COMPONENT = createEmptyScheme<URIComponent>([
    "endpoint",
    "hostname",
    "href",
    "origin",
    "params",
    "port",
    "protocol",
    "urlMount"
]);

export const DEFAULT_PIPELINE_EXECUTORS: PipelineExecutorsManager = {
    request: [],
    response: []
};

export const DEFAULT_CLIENT_OPTIONS: InternalConfiguration = {
    url: merge(DEFAULT_URI_COMPONENT, {
        protocol: "http",
        urlMount: "/api"
    }),
    timeout: 0,
    method: "GET",
    headers: null,
    data: null,
    cache: {},
    pipelines: DEFAULT_PIPELINE_EXECUTORS,
    maxContentLength: Infinity
};

export const DEFAULT_URBEX_RESPONSE = createEmptyScheme<UrbexResponse>([
    "status",
    "statusText",
    "headers",
    "data",
    "config",
    "request",
    "response",
    "duration",
    "timestamp",
    "cache.key",
    "cache.hit",
    "cache.pulled",
    "cache.stored"
]);
