type DebugType = "log" | "warn" | "error";

export function debug(type: DebugType, message: string): void {
    console[type](`[urbex] ${message}`);
}
