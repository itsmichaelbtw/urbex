import type { InternalConfiguration, URLComponent, UrbexResponse } from "../exportable-types";
import type { ParsedURLComponent, PipelineExecutorsManager } from "../types";

import { createEmptyScheme } from "../utils";

export const REQUEST_BODY_METHODS = ["POST", "PUT", "PATCH"];

export const URL_COMPONENT_KEYS: (keyof URLComponent)[] = [
    "href",
    "origin",
    "protocol",
    "username",
    "password",
    "hostname",
    "port",
    "pathname",
    "search",
    "searchParams",
    "hash"
];

export const DEFAULT_URL_COMPONENT = createEmptyScheme<ParsedURLComponent>(URL_COMPONENT_KEYS, "");

export const DEFAULT_PIPELINE_EXECUTORS: PipelineExecutorsManager = {
    request: [],
    response: []
};

export const DEFAULT_CLIENT_OPTIONS: InternalConfiguration = {
    url: null,
    timeout: 0,
    method: "GET",
    headers: null,
    data: null,
    cache: {},
    pipelines: DEFAULT_PIPELINE_EXECUTORS,
    maxContentLength: Infinity,
    responseType: "json",
    responseEncoding: "utf8",
    resolveStatus: (config, status) => {
        return status >= 200 && status < 300;
    }
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

export const METHODS = ["PUT", "POST", "PATCH", "OPTIONS", "HEAD", "GET", "DELETE"];
