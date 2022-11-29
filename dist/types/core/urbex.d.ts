import type { CacheClock } from "cache-clock";
import type { DispatchedResponse } from "../types";
import type { UrbexURL, UrbexConfig, InternalConfiguration } from "../exportable-types";
import { RequestApi } from "./api/request-api";
type UrbexDirectRequest = Omit<UrbexConfig, "data" | "url" | "cache">;
type UrbexMethodRequest = Omit<UrbexDirectRequest, "method">;
export interface UrbexClient {
    /**
     * Send a GET request.
     */
    get(url: UrbexURL, config?: UrbexMethodRequest): DispatchedResponse;
    /**
     * Send a POST request.
     */
    post(url: UrbexURL, data?: any, config?: UrbexMethodRequest): DispatchedResponse;
    /**
     * Send a PUT request.
     */
    put(url: UrbexURL, data?: any, config?: UrbexMethodRequest): DispatchedResponse;
    /**
     * Send a PATCH request.
     */
    patch(url: UrbexURL, data?: any, config?: UrbexMethodRequest): DispatchedResponse;
    /**
     * Send a DELETE request.
     */
    delete(url: UrbexURL, config?: UrbexMethodRequest): DispatchedResponse;
    /**
     * Send a HEAD request.
     */
    head(url: UrbexURL, config?: UrbexMethodRequest): DispatchedResponse;
    /**
     * Send a OPTIONS request.
     */
    options(url: UrbexURL, config?: UrbexMethodRequest): DispatchedResponse;
}
export declare class UrbexClient extends RequestApi {
    private $config;
    constructor(config?: UrbexConfig);
    /**
     *
     * Creates a new instance of the UrbexClient.
     */
    static create(config?: UrbexConfig): UrbexClient;
    /**
     * Current, and most up-to-date configuration of the UrbexClient.
     */
    get config(): Readonly<InternalConfiguration>;
    /**
     * The internal cache module.
     */
    get cache(): Readonly<CacheClock>;
    /**
     * Configures the UrbexClient. You are free to call this method as
     * many times as you want. All configurations will be merged together.
     *
     * @param config The configuration to use.
     */
    configure(config: UrbexConfig): void;
    send(config?: UrbexConfig): DispatchedResponse;
    /**
     * Inject pipelines into the UrbexClient. This allows you to add custom logic to the request/response
     */
    injectPipeline(): void;
    /**
     * Eject a pipeline from the UrbexClient.
     */
    ejectPipeline(): void;
    /**
     * When a response is received, the UrbexClient will actively push out the response to all active
     * subscriptions
     */
    subscribe(): void;
    unsubscribe(): void;
    /**
     * Reset the configuration to default values.
     */
    reset(): void;
}
export declare function isUrbexClient(client: unknown): client is UrbexClient;
export {};
