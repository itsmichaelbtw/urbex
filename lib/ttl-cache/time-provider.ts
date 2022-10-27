import { environment } from "../environment";

interface TimeProvider {
    now(): number;
}

function getBestTimeProvider(): TimeProvider {
    try {
        // if (environment.isNode) {
        //     return require("perf_hooks").performance;
        // }

        // if (environment.isBrowser) {
        //     if (window.performance && window.performance.now) {
        //         return window.performance;
        //     }
        // }

        return Date;
    } catch (error) {
        return Date;
    }
}

export const timeProvider = getBestTimeProvider();
