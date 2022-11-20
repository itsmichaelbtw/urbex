type ReturnType<T> = T extends (config: any) => infer R ? R : any;
type Parameters<T extends Function> = T extends (config: infer P) => any ? P : never;

export class PipelineExecutor<T extends Function> {
    private $executor: T = null;

    constructor(executor: T) {
        this.$executor = executor;
    }

    public execute(config: Parameters<T>): ReturnType<T> {
        return this.$executor(config);
    }
}
