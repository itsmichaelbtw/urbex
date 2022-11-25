import fs from "fs";
import path from "path";
import url from "url";
import cors from "cors";
import express from "express";

import { ensureLeadingToken, lowercase } from "../lib/utils";
import { METHODS } from "../lib/constants";
import { MethodsUpper, MethodsLower } from "../lib/types";

type ExpressCallback = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => Promise<any> | any;
type ResponseType = "text" | "json" | "blob" | "arraybuffer" | "document" | "stream";
type LaunchServer = { stop(): void };

function responseTypeAsText(_, response: express.Response): string {
    response.set("Content-Type", "text/plain");

    return "This is a text response.";
}

function responseTypeAsJSON(_, response: express.Response): object {
    response.set("Content-Type", "application/json");

    return {
        message: "This is a JSON response."
    };
}

function responseTypeAsBlob(_, response: express.Response): Buffer {
    response.set("Content-Type", "application/octet-stream");

    return Buffer.from("This is a blob response.");
}

function responseTypeAsArrayBuffer(_, response: express.Response): ArrayBuffer {
    response.set("Content-Type", "application/octet-stream");

    return Buffer.from("This is an arraybuffer response.").buffer;
}

function responseTypeAsDocument(_, response: express.Response): string {
    response.set("Content-Type", "text/plain");

    return "<!DOCTYPE html><html><body><h1>This is a document response.</h1><p>With a paragraph.</p></body></html>";
}

export function launchServer(_port: number): LaunchServer {
    const app = express();
    const port = parseInt(_port.toString()) || 3000;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(
        cors({
            origin: "*",
            allowedHeaders: "*",
            preflightContinue: true,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
            credentials: true
        })
    );

    app.use((request, response, next) => {
        if (request.method === "OPTIONS") {
            response.status(200).end();
            return;
        }

        next();
    });

    app.get("/", (request, response) => {
        const routes = app._router.stack
            .filter((layer: any) => layer.route)
            .map((layer: any) => {
                const route = layer.route;

                return {
                    path: route.path,
                    methods: Object.keys(route.methods).map((method) => {
                        return {
                            method: method.toUpperCase(),
                            path: route.path
                        };
                    })
                };
            });

        response.json(routes);
    });

    app.get("/delay/:delay", (request, response) => {
        const delay = parseInt(request.params.delay);

        setTimeout(() => {
            response.json({
                message: `Delayed response by ${delay}ms.`
            });
        }, delay);
    });

    responseTypeResolver("text", responseTypeAsText);
    responseTypeResolver("json", responseTypeAsJSON);
    responseTypeResolver("blob", responseTypeAsBlob);
    responseTypeResolver("arraybuffer", responseTypeAsArrayBuffer);
    responseTypeResolver("document", responseTypeAsDocument);

    httpStatusCodesSetup();

    app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
        response.status(404).send("Not found.");
    });

    function registerOneTripRoute(
        route: string,
        method: MethodsLower,
        callback: ExpressCallback
    ): void {
        app[method](
            ensureLeadingToken("/", route),
            async (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const result = await callback(req, res, next);
                res.send(result);
            }
        );
    }

    function responseTypeResolver(type: ResponseType, callback: ExpressCallback): void {
        for (const method of METHODS) {
            const lower = lowercase(method) as MethodsLower;

            registerOneTripRoute(type, lower, callback);
        }
    }

    function httpStatusCodesSetup(): void {
        const statusCodes: number[] = [];

        for (let i = 100; i <= 599; i++) {
            if ((i > 104 && i < 200) || (i > 208 && i < 300) || (i > 308 && i < 400) || i > 508) {
                continue;
            }

            statusCodes.push(i);
        }

        for (const code of statusCodes) {
            for (const method of METHODS) {
                const lower = lowercase(method) as MethodsLower;

                registerOneTripRoute(`${code}`, lower, (req, res) => {
                    res.status(code);
                    return `Status code ${code}.`;
                });
            }
        }
    }

    const server = app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    return {
        stop: () => {
            server.close();
        }
    };
}
