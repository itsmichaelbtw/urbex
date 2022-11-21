/// <reference types="node" />
export type UrbexContext = "browser" | "node";
export declare class Environment {
    private _context;
    constructor();
    private detectContext;
    private nodeStrictCheck;
    get process(): NodeJS.Process;
    get context(): UrbexContext;
    get isBrowser(): boolean;
    get isNode(): boolean;
    get isDevelopment(): boolean;
    get isProduction(): boolean;
}
export declare const environment: Environment;
