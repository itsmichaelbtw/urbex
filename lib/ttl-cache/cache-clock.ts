import { environment } from "../environment";

type Timeout = null | ReturnType<typeof setTimeout>;
type ClockMap = Map<string, ClockItem>;
type InvokeTimeout = (callback: Function, delay: number) => Timeout;

interface ClockItem {
    key: string;
    timeout: Timeout;
}

interface ClockOptions {
    ttl: number;
    onExpire: Function;
}

export class CacheClock {
    private _options: ClockOptions;
    private _clocks: ClockMap = new Map();

    constructor(options?: ClockOptions) {
        if (options) {
            this.configure(options);
        }
    }

    static create(options: ClockOptions): CacheClock {
        return new CacheClock(options);
    }

    private nativeTimeout(): InvokeTimeout {
        if (environment.isNode) {
            return global.setTimeout;
        }

        if (environment.isBrowser) {
            return window.setTimeout;
        }

        return null;
    }

    configure(options: ClockOptions): void {
        this._options = options;
    }

    add(key: string, ttl: number): void {
        if (this._clocks.has(key)) {
            this.remove(key);
        }

        const timeout = this.nativeTimeout();

        if (timeout === null) {
            return;
        }

        const item: ClockItem = {
            key: key,
            timeout: timeout(() => {
                this.remove(key);
            }, ttl)
        };

        this._clocks.set(key, item);
    }

    remove(key: string): void {
        const item = this._clocks.get(key);

        if (item) {
            clearTimeout(item.timeout);
            this._clocks.delete(key);
        }

        if (this._options.onExpire) {
            this._options.onExpire(key);
        }
    }

    clear(): void {
        for (const [key, item] of this._clocks) {
            clearTimeout(item.timeout);
        }
    }
}
