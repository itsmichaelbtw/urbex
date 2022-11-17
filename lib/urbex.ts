import type { ConfigurableUrbexClient } from "./core/types";

import { environment, Environment } from "./environment";
import { UrbexClient, isUrbexClient } from "./core/urbex";

interface IUrbexClient extends UrbexClient {
    /**
     * Create a new isolated instance of the Urbex client
     *
     * Any existing configuration will be copied to the new
     * instance. Furthermore, changes made to the new instance
     * will not affect the original instance
     */
    isolateClient(config?: ConfigurableUrbexClient): UrbexClient;
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

function createClient(): IUrbexClient {
    const client = UrbexClient.create();
    const extendedClient = client as IUrbexClient;

    extendedClient.isolateClient = UrbexClient.create;
    extendedClient.environment = environment;
    extendedClient.isUrbexClient = isUrbexClient;
    extendedClient.Client = UrbexClient;

    return extendedClient;
}

const urbex = createClient();

export * from "./core/types";

export default urbex;
