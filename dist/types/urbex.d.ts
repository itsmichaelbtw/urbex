import type { UrbexConfig } from "./exportable-types";
import { Environment } from "./environment";
import { UrbexClient } from "./core/urbex";
export interface ExtendedUrbexClient extends UrbexClient {
    /**
     * Create a new isolated instance of the Urbex client
     *
     * Any existing configuration will be copied to the new
     * instance. Furthermore, changes made to the new instance
     * will not affect the original instance
     */
    isolateClient(config?: UrbexConfig): UrbexClient;
    /**
     *
     * TypeScript safe guard to check if an object is an instance of UrbexClient
     */
    isUrbexClient(client: unknown): client is UrbexClient;
    /**
     * The underlying UrbexClient class which can be used to create new instances
     *
     * Recommended to use `isolateClient` instead
     */
    Client: typeof UrbexClient;
    /**
     * The current environment of the project
     */
    environment: Environment;
}
declare const urbex: ExtendedUrbexClient;
export * from "./exportable-types";
export * from "./core/pipelines";
export default urbex;