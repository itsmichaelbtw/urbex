type ReturnType<T> = T extends (config: any) => infer R ? R : any;
type Parameters<T extends Function> = T extends (config: infer P) => any ? P : never;
export declare class PipelineExecutor<T extends Function> {
    private $executor;
    constructor(executor: T);
    execute(config: Parameters<T>): ReturnType<T>;
}
export {};
