import type { InternalConfiguration, UrbexConfig } from "../exportable-types";
export declare class RequestConfig {
    private $config;
    constructor(config?: UrbexConfig);
    defaultConfig(): InternalConfiguration;
    createConfigurationObject(config: UrbexConfig, allowEndpoints: boolean): InternalConfiguration;
    parseIncomingConfig(config: UrbexConfig, allowEndpoints: boolean): Partial<InternalConfiguration>;
    set(config: InternalConfiguration): InternalConfiguration;
    merge(config?: InternalConfiguration | Partial<InternalConfiguration>): InternalConfiguration;
    get(): InternalConfiguration;
    /**
     * Reset the configuration to its default state.
     */
    reset(): void;
}
