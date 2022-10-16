import { env } from "./env";

export type UrbexContext = "browser" | "node";

export class Environment {
    private _context: UrbexContext;

    constructor() {
        this._context = this.detectContext();
    }

    private detectContext(): UrbexContext {
        if (
            typeof window !== "undefined" &&
            typeof window.document !== "undefined"
        ) {
            return "browser";
        }

        if (
            typeof process !== "undefined" &&
            process.versions &&
            process.versions.node
        ) {
            return "node";
        }

        throw new Error("Could not detect environment context");
    }

    get context(): UrbexContext {
        return this._context;
    }

    get isBrowser(): boolean {
        return this.context === "browser";
    }

    get isNode(): boolean {
        return this.context === "node";
    }

    get isDevelopment(): boolean {
        return env.get("NODE_ENV") === "development";
    }

    get isProduction(): boolean {
        return env.get("NODE_ENV") === "production";
    }
}

export const environment = new Environment();
