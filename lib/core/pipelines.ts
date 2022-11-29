import { mutate, argumentIsNotProvided, isObject } from "../utils";

type ReturnType<T> = T extends (config: any) => infer R ? R : any;
type Parameters<T extends Function> = T extends (config: infer P) => any ? P : never;

export class PipelineExecutor<T extends Function> {
    private $executor: T = null;

    constructor(executor: T) {
        this.$executor = executor;
    }

    public static async process<T, D extends Function>(
        config: T,
        pipelines: PipelineExecutor<D>[]
    ): Promise<void> {
        for (const pipeline of pipelines) {
            const pipelineResult = await pipeline.execute(config as Parameters<D>);

            if (!isObject(pipelineResult) || argumentIsNotProvided(pipelineResult)) {
                throw new Error(
                    "Urbex expected a valid configuration to be returned from a pipeline."
                );
            }

            config = mutate(config, () => {
                return pipelineResult;
            });
        }
    }

    public execute(config: Parameters<T>): ReturnType<T> {
        return this.$executor(config);
    }
}
