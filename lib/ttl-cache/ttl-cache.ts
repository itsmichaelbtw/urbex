import { isUndefined, isNegative, absolute, merge } from "../utils";
import { timeProvider } from "./time-provider";
import { CacheClock } from "./cache-clock";
import { hash } from "./hash";

type CacheMap = Map<string, CacheItem>;
type CacheTTL = number;

interface CacheItem {
    value: any;
    expires: number;
}

export interface CacheOptions {
    /**
     * The maximum number of items to store in the cache.
     *
     * Defaults to `1000`.
     */
    maxItems: number;
    /**
     * The default time to live for items in the cache.
     *
     * Defaults to `Infinity`.
     */
    ttl: CacheTTL;
}

interface CacheManipulatorOptions {
    ttl: CacheTTL;
}

const defaultCacheOptions: CacheOptions = {
    maxItems: 1000,
    ttl: Infinity
};

function parseOptions(
    options: Partial<CacheOptions> = {},
    defaultOptions: CacheOptions
): CacheOptions {
    const opts = merge(defaultOptions, options);

    if (isNegative(opts.maxItems)) {
        opts.maxItems = absolute(opts.maxItems);
    }

    if (isNegative(opts.ttl)) {
        opts.ttl = absolute(opts.ttl);
    }

    if (opts.maxItems === 0) {
        opts.maxItems = 1;
    }

    return opts;
}

export class TTLCache {
    private _options: CacheOptions;
    private _cache: CacheMap = new Map();
    private _cacheClock: CacheClock = new CacheClock();

    constructor(options?: Partial<CacheOptions>) {
        const opts = parseOptions(options, defaultCacheOptions);

        this._options = opts;
        this._cacheClock.configure({
            ttl: opts.ttl,
            onExpire: (key: string) => {
                this.remove(key);
            }
        });
    }

    static create(options?: Partial<CacheOptions>): TTLCache {
        return new TTLCache(options);
    }

    get options(): CacheOptions {
        return this._options;
    }

    get size(): number {
        return this._cache.size;
    }

    set(key: string, value: any, options?: CacheManipulatorOptions): void {
        const keyHash = hash(key);

        if (this._cache.has(keyHash)) {
            this._cacheClock.remove(keyHash);
        }

        const { ttl } = parseOptions(options, this.options);

        const item: CacheItem = {
            value: JSON.stringify(value),
            expires: timeProvider.now() + ttl
        };

        this._cache.set(keyHash, item);
        this._cacheClock.add(keyHash, ttl);
    }

    get(key: string, isHashed: boolean = false): any {
        if (!isHashed) {
            key = hash(key);
        }

        const item = this._cache.get(key);

        if (isUndefined(item)) {
            return undefined;
        }

        try {
            return JSON.parse(item.value);
        } catch {
            return item.value;
        }
    }

    has(key: string): boolean {
        return this._cache.has(key);
    }

    remove(key: string): void {
        this._cache.delete(key);
    }

    prune(): void {
        const now = timeProvider.now();

        for (const [key, item] of this._cache) {
            if (item.expires < now) {
                this.remove(key);
            }
        }
    }

    clear(): void {
        this._cache.clear();
        this._cacheClock.clear();
    }

    [Symbol.iterator](): IterableIterator<[string, CacheItem]> {
        return this._cache.entries();
    }
}
