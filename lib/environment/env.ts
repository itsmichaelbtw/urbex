import fs from "fs";
import path from "path";
import os from "os";

import { DOTENV_FILENAME, DOTENV_LINE } from "../constants";
import { hasOwnProperty, isUndefined } from "../utils";

interface Env {
    [key: string]: string;
}

interface EnvManipulator {
    /**
     * Parses the .env file and returns an object
     */
    parse(file: Buffer): Env;

    /**
     * Configures the environment variables from the .env file
     */
    configure(): Env;

    /**
     * Sets the environment variable
     */
    set(key: string, value: string): void;

    /**
     * Gets the environment variable
     */
    get(key?: string): string | undefined;
}

function parse(file: Buffer): Env {
    try {
        const env: Env = {};
        const lines = file.toString().replace(os.EOL, "\n").split("\n");

        for (const line of lines) {
            const isMatch = DOTENV_LINE.test(line);

            if (!isMatch) {
                continue;
            }

            let [key, value] = line.split("=");

            value = value.replace(/^['"]|['"]$/g, "");

            key = key.trim();
            value = value.trim();

            env[key] = value;
        }

        return env;
    } catch (error) {
        return {};
    }
}

function configure(): Env {
    const envPath = path.resolve(process.cwd(), DOTENV_FILENAME);

    try {
        const file = fs.readFileSync(envPath);
        const env = parse(file);

        for (const key in env) {
            // if the environment variable already exists, skip it
            // add support for overriding the environment variable

            if (hasOwnProperty(process.env, key)) {
                continue;
            }

            set(key, env[key]);
        }

        return env;
    } catch (error) {
        return {};
    }
}

function get(key: string): string {
    const value = process.env[key];

    if (isUndefined(value)) {
        return "undefined";
    }

    return value;
}

function set(key: string, value: string): void {
    process.env[key] = value;
}

const env: EnvManipulator = {
    parse: parse,
    configure: configure,
    set: set,
    get: get
};

export { env };
