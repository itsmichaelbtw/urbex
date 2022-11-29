import chai from "chai";

import { PORT, SERVER_URL } from "../constants";

import urbex, { PipelineExecutor } from "../../lib/urbex";

const client = urbex.isolateClient();

describe("client", () => {
    beforeEach(() => {
        client.reset();
    });

    after(() => {
        client.cache.stop();
    });

    it("should perform a request and return a promise", async () => {
        const request = client.get(`${SERVER_URL}/200`);

        chai.expect(request).to.be.an.instanceOf(Promise);

        const response = await request;

        chai.expect(response).to.be.a("object");
        chai.expect(response).to.have.property("status");
        chai.expect(response).to.have.property("statusText");
        chai.expect(response).to.have.property("headers");
        chai.expect(response).to.have.property("data");
        chai.expect(response).to.have.property("config");
        chai.expect(response).to.have.property("request");
        chai.expect(response).to.have.property("response");
        chai.expect(response).to.have.property("duration");
        chai.expect(response).to.have.property("timestamp");
        chai.expect(response).to.have.property("cache");
        chai.expect(response).to.have.property("responseType");
    });

    it("should perform CRUD requests (alias)", async () => {
        const url = `${SERVER_URL}/200`;

        const [
            getResponse,
            postResponse,
            putResponse,
            patchResponse,
            deleteResponse,
            headResponse,
            optionsResponse
        ] = await Promise.all([
            client.get(url),
            client.post(url),
            client.put(url),
            client.patch(url),
            client.delete(url),
            client.head(url),
            client.options(url)
        ]);

        chai.expect(getResponse.status).to.equal(200);
        chai.expect(postResponse.status).to.equal(200);
        chai.expect(putResponse.status).to.equal(200);
        chai.expect(patchResponse.status).to.equal(200);
        chai.expect(deleteResponse.status).to.equal(200);
        chai.expect(headResponse.status).to.equal(200);
        chai.expect(optionsResponse.status).to.equal(200);
    });

    it("should perform CRUD requests (method)", async () => {
        const url = `${SERVER_URL}/200`;

        const [
            getResponse,
            postResponse,
            putResponse,
            patchResponse,
            deleteResponse,
            headResponse,
            optionsResponse
        ] = await Promise.all([
            client.send({
                method: "GET",
                url: url
            }),
            client.send({
                method: "POST",
                url: url
            }),
            client.send({
                method: "PUT",
                url: url
            }),
            client.send({
                method: "PATCH",
                url: url
            }),
            client.send({
                method: "DELETE",
                url: url
            }),
            client.send({
                method: "HEAD",
                url: url
            }),
            client.send({
                method: "OPTIONS",
                url: url
            })
        ]);

        chai.expect(getResponse.status).to.equal(200);
        chai.expect(postResponse.status).to.equal(200);
        chai.expect(putResponse.status).to.equal(200);
        chai.expect(patchResponse.status).to.equal(200);
        chai.expect(deleteResponse.status).to.equal(200);
        chai.expect(headResponse.status).to.equal(200);
        chai.expect(optionsResponse.status).to.equal(200);
    });

    describe("errors", () => {
        it("should catch errors", async () => {
            try {
                await client.get(`${SERVER_URL}/404`);
            } catch (error) {
                chai.expect(error).to.be.an.instanceOf(Error);
                chai.expect(error.status).to.equal(404);
                chai.expect(error).to.have.property("status");
                chai.expect(error).to.have.property("config");
                chai.expect(error).to.have.property("request");
                chai.expect(error).to.have.property("response");
                chai.expect(error).to.have.property("message");
            }
        });

        it("the configuration object should be apart of the error", async () => {
            try {
                await client.get(`${SERVER_URL}/404`, {
                    responseType: "text",
                    responseEncoding: "ascii"
                });
            } catch (error) {
                chai.expect(error.config).to.be.an("object");
                chai.expect(error.config).to.have.property("responseType");
                chai.expect(error.config).to.have.property("responseEncoding");
            }
        });
    });

    describe("data", () => {});

    describe("headers", () => {});

    describe("timeout", () => {
        it("should not timeout when a value is not provided", async () => {
            const response = await client.get(`${SERVER_URL}/delay/500`);

            chai.expect(response.status).to.equal(200);
        });

        it("should timeout when a value is provided", async () => {
            try {
                await client.get(`${SERVER_URL}/delay/500`, {
                    timeout: 100
                });
            } catch (error) {
                chai.expect(error).to.be.an.instanceOf(Error);
                chai.expect(error).to.have.property("message");
                chai.expect(error.name).to.equal("TimeoutError");
                chai.expect(error.message).to.equal("Timeout of 100ms exceeded");
            }
        });
    });

    describe("cache", () => {
        it("should store the response in the cache", async () => {
            client.configure({
                cache: {
                    enabled: true,
                    autoStart: false
                }
            });

            const response = await client.get(`${SERVER_URL}/text`);

            chai.expect(response.data).to.equal("This is a text response.");
            chai.expect(response.cache.hit).to.be.true;
            chai.expect(response.cache.stored).to.be.true;
            chai.expect(response.cache.key).to.be.a("string");
        });

        it("should retrieve the response from the cache", async () => {
            client.configure({
                cache: {
                    enabled: true
                }
            });

            await client.get(`${SERVER_URL}/text`);

            const response = await client.get(`${SERVER_URL}/text`);

            chai.expect(response.data).to.equal("This is a text response.");
            chai.expect(response.status).to.equal(200);
            chai.expect(response.statusText).to.equal("Pulled from internal cache");
            chai.expect(response.cache.hit).to.be.true;
            chai.expect(response.cache.stored).to.be.false;
            chai.expect(response.cache.pulled).to.be.true;
            chai.expect(response.cache.key).to.be.a("string");
        });

        it("pipeline executors should still be executed", async () => {
            client.configure({
                cache: {
                    enabled: true
                }
            });

            let pipelineExecuted = false;

            await client.get(`${SERVER_URL}/text`);

            const response = await client.get(`${SERVER_URL}/text`, {
                pipelines: {
                    response: [
                        new PipelineExecutor((config) => {
                            pipelineExecuted = true;
                            return Promise.resolve(config);
                        })
                    ]
                }
            });

            chai.expect(pipelineExecuted).to.be.true;
            chai.expect(response.cache.pulled).to.be.true;
        });
    });

    describe("pipelines", () => {});

    describe("maxContentLength", () => {});

    describe("responseType", () => {});

    describe("responseEncoding", () => {});

    describe("resolveStatus", () => {
        it("should allow custom behaviour over resolving status codes", async () => {
            client.configure({
                resolveStatus: (config, status) => {
                    return status > 300 && status <= 400;
                }
            });

            client
                .get(`${SERVER_URL}/302`)
                .then((response) => {
                    chai.expect(response.status).to.equal(404);
                })
                .catch((error) => {
                    throw error;
                });

            client
                .get(`${SERVER_URL}/400`)
                .then((response) => {
                    chai.expect(response.status).to.equal(404);
                })
                .catch((error) => {
                    throw error;
                });

            client
                .get(`${SERVER_URL}/404`)
                .then((response) => {
                    throw new Error("Should not have resolved");
                })
                .catch((error) => {
                    chai.expect(error.status).to.equal(404);
                });
        });

        it("the config should be up to date, including after pipeline execution", async () => {
            client.configure({
                pipelines: {
                    request: [
                        new PipelineExecutor(async (config) => {
                            config.headers.set({
                                chai: "expect"
                            });
                            return Promise.resolve(config);
                        })
                    ]
                },
                resolveStatus: (config, status) => {
                    chai.expect(config.headers.get().Chai).to.equal("expect");
                    return status >= 200 && status < 300;
                }
            });

            const response = await client.get(`${SERVER_URL}/200`);

            chai.expect(response.status).to.equal(200);
        });
    });
});
