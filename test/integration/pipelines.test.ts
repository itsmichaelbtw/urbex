import chai from "chai";

import { SERVER_URL } from "../constants";
import urbex, {
    PipelineExecutor,
    RequestExecutor,
    InternalConfiguration,
    UrbexConfig,
    UrbexResponse,
    ResponseExecutor,
    PipelineError
} from "../../lib/urbex";
import { UrbexHeaders } from "../../lib/core/headers";

const client = urbex.isolateClient({
    url: SERVER_URL
});

describe("pipelines", () => {
    it("should have `process` method (static)", () => {
        chai.expect(PipelineExecutor).to.have.property("process");
    });

    it("should create a new pipeline instance", () => {
        const myPipeline = new PipelineExecutor<RequestExecutor>((config) => {
            return Promise.resolve(config);
        });

        chai.expect(myPipeline).to.be.an.instanceOf(PipelineExecutor);
        chai.expect(myPipeline).to.have.property("execute");
    });

    it("should execute a pipeline", async () => {
        let executed = false;

        const myPipeline = new PipelineExecutor<RequestExecutor>((config) => {
            config.data = "Hello World";

            executed = true;

            return Promise.resolve(config);
        });

        const result = await myPipeline.execute({} as InternalConfiguration);

        chai.expect(result).to.be.an("object");
        chai.expect(result).to.have.property("data");
        chai.expect(result.data).to.equal("Hello World");
        chai.expect(executed).to.equal(true);
    });

    it("should throw an error if an invalid pipeline is passed", async () => {
        try {
            await client.get("/200", {
                pipelines: {
                    request: [
                        // @ts-expect-error
                        {}
                    ]
                }
            });
        } catch (error) {
            chai.expect(error).to.be.an.instanceOf(PipelineError);
            chai.expect(error.name).to.equal("PipelineError");
            chai.expect(error.message).to.equal(
                "Urbex expected a valid pipeline to be passed to the `process` method."
            );
        }
    });

    it("should throw an error if an invalid configuration is passed", async () => {
        const myPipeline = new PipelineExecutor<RequestExecutor>((config) => {
            return Promise.resolve([] as any);
        });

        try {
            await PipelineExecutor.process<InternalConfiguration, RequestExecutor>({} as any, [
                myPipeline
            ]);
        } catch (error) {
            chai.expect(error).to.be.an.instanceOf(Error);
            chai.expect(error.message).to.equal(
                "Urbex expected a valid configuration to be returned from a pipeline."
            );
        }
    });

    it("should mutate the configuration object", async () => {
        // @ts-expect-error
        const requestConfig: InternalConfiguration = {
            headers: new UrbexHeaders()
        };
        // @ts-expect-error
        const responseConfig: UrbexResponse = {};

        const requestPipeline = new PipelineExecutor<RequestExecutor>((config) => {
            config.headers.set({
                "Request-Header": "Hello World"
            });
            return Promise.resolve(config);
        });

        const responsePipeline = new PipelineExecutor<ResponseExecutor>((config) => {
            config.headers = {
                "Response-Header": "Hello World"
            };
            return Promise.resolve(config);
        });

        await PipelineExecutor.process<InternalConfiguration, RequestExecutor>(requestConfig, [
            requestPipeline
        ]);

        await PipelineExecutor.process<UrbexResponse, ResponseExecutor>(responseConfig, [
            responsePipeline
        ]);

        chai.expect(requestConfig).to.be.an("object");
        chai.expect(requestConfig).to.have.property("headers");
        chai.expect(requestConfig.headers.get()).to.have.property("Request-Header");
        chai.expect(requestConfig.headers.get()["Request-Header"]).to.equal("Hello World");

        chai.expect(responseConfig).to.be.an("object");
        chai.expect(responseConfig).to.have.property("headers");
        chai.expect(responseConfig.headers).to.have.property("Response-Header");
        chai.expect(responseConfig.headers["Response-Header"]).to.equal("Hello World");
    });

    it("each pipeline should be executed in order", async () => {
        const config: InternalConfiguration = {} as any;
        const tokens: string[] = [];

        const pipelines = [
            new PipelineExecutor<RequestExecutor>((config) => {
                config.data = "Hello";
                tokens.push("1");
                return Promise.resolve(config);
            }),
            new PipelineExecutor<RequestExecutor>((config) => {
                config.data += " World";
                tokens.push("2");
                return Promise.resolve(config);
            }),
            new PipelineExecutor<RequestExecutor>((config) => {
                config.data += "!";
                tokens.push("3");
                return Promise.resolve(config);
            })
        ];

        await PipelineExecutor.process<InternalConfiguration, RequestExecutor>(config, pipelines);

        chai.expect(config).to.be.an("object");
        chai.expect(config).to.have.property("data");
        chai.expect(config.data).to.equal("Hello World!");
        chai.expect(tokens).to.deep.equal(["1", "2", "3"]);
    });

    describe("when making a request", () => {
        it("the pipelines should be executed in order (request)", async () => {
            const tokens: string[] = [];

            const requestPipelines = [
                new PipelineExecutor<RequestExecutor>((config) => {
                    tokens.push("1");
                    return Promise.resolve(config);
                }),
                new PipelineExecutor<RequestExecutor>((config) => {
                    tokens.push("2");
                    return Promise.resolve(config);
                }),
                new PipelineExecutor<RequestExecutor>((config) => {
                    tokens.push("3");
                    return Promise.resolve(config);
                })
            ];

            const response = await client.get("/200", {
                pipelines: {
                    request: requestPipelines
                }
            });

            chai.expect(response).to.be.an("object");
            chai.expect(tokens).to.deep.equal(["1", "2", "3"]);
        });

        it("the pipelines should be executed in order (response)", async () => {
            const tokens: string[] = [];

            const responsePipelines = [
                new PipelineExecutor<ResponseExecutor>((config) => {
                    tokens.push("1");
                    return Promise.resolve(config);
                }),
                new PipelineExecutor<ResponseExecutor>((config) => {
                    tokens.push("2");
                    return Promise.resolve(config);
                }),
                new PipelineExecutor<ResponseExecutor>((config) => {
                    tokens.push("3");
                    return Promise.resolve(config);
                })
            ];

            await client.get("/200", {
                pipelines: {
                    response: responsePipelines
                }
            });

            chai.expect(tokens).to.deep.equal(["1", "2", "3"]);
        });

        it("if an error is thrown in a pipeline, the request should fail", async () => {
            const requestPipelines = [
                new PipelineExecutor<RequestExecutor>((config) => {
                    throw new Error("Failed in pipeline");
                })
            ];

            try {
                await client.get("/200", {
                    pipelines: {
                        request: requestPipelines
                    }
                });
            } catch (error) {
                chai.expect(error).to.be.an.instanceOf(Error);
                chai.expect(error.name).to.equal("PipelineError");
                chai.expect(error.message).to.equal("Failed in pipeline");
            }

            const responsePipelines = [
                new PipelineExecutor<ResponseExecutor>((config) => {
                    throw new Error("Request succeeded, but failed in pipeline");
                })
            ];

            try {
                await client.get("/200", {
                    pipelines: {
                        response: responsePipelines
                    }
                });
            } catch (error) {
                chai.expect(error).to.be.an.instanceOf(Error);
                chai.expect(error.name).to.equal("PipelineError");
                chai.expect(error.message).to.equal("Request succeeded, but failed in pipeline");
                chai.expect(error.status).to.equal(200);
            }
        });

        it("if a pipeline returns a rejected promise, the request should fail", async () => {
            const requestPipelines = [
                new PipelineExecutor<RequestExecutor>((config) => {
                    return Promise.reject("Failed in pipeline");
                })
            ];

            try {
                await client.get("/200", {
                    pipelines: {
                        request: requestPipelines
                    }
                });
            } catch (error) {
                chai.expect(error).to.be.an.instanceOf(Error);
                chai.expect(error.name).to.equal("PipelineError");
                chai.expect(error.message).to.equal("Failed in pipeline");
            }

            const responsePipelines = [
                new PipelineExecutor<ResponseExecutor>((config) => {
                    return Promise.reject("Request succeeded, but failed in pipeline");
                })
            ];

            try {
                await client.get("/200", {
                    pipelines: {
                        response: responsePipelines
                    }
                });
            } catch (error) {
                chai.expect(error).to.be.an.instanceOf(Error);
                chai.expect(error.name).to.equal("PipelineError");
                chai.expect(error.message).to.equal("Request succeeded, but failed in pipeline");
                chai.expect(error.status).to.equal(200);
            }
        });

        it("modifying the request config should update the request correctly without mutation to global config", async () => {
            const client = urbex.isolateClient({
                url: SERVER_URL
            });

            chai.expect(client.config.url.href).to.equal(SERVER_URL);

            const requestPipelines = [
                new PipelineExecutor<RequestExecutor>((config) => {
                    config.url.pathname = "/200";
                    config.url.setSearchParams(new URLSearchParams("test=1"));
                    config.headers.set({
                        "test-header": "1"
                    });

                    return Promise.resolve(config);
                }),
                new PipelineExecutor<RequestExecutor>((config) => {
                    chai.expect(config.url.pathname).to.equal("/200");
                    chai.expect(config.url.searchParams.get("test")).to.equal("1");
                    config.headers.set({
                        "test-header-2": "2"
                    });

                    return Promise.resolve(config);
                })
            ];

            const response = await client.send({
                pipelines: {
                    request: requestPipelines
                }
            });

            chai.expect(response.status).to.equal(200);
            chai.expect(response.config.url.pathname).to.equal("/200");
            chai.expect(response.config.url.searchParams.get("test")).to.equal("1");
            chai.expect(response.config.headers.get()["test-header"]).to.equal("1");
            chai.expect(response.config.headers.get()["test-header-2"]).to.equal("2");

            chai.expect(client.config.url.href).to.equal(SERVER_URL);
            chai.expect(client.config.url.pathname).to.equal("");
            chai.expect(client.config.url.searchParams.get("test")).to.equal(null);
            chai.expect(client.config.headers.get()["test-header"]).to.equal(undefined);
            chai.expect(client.config.headers.get()["test-header-2"]).to.equal(undefined);
        });
    });
});
