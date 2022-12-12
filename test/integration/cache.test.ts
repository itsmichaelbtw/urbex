import chai from "chai";

import { PORT, SERVER_URL } from "../constants";

import urbex, { PipelineExecutor } from "../../lib/urbex";

const client = urbex.isolateClient({ cache: { enabled: true } });

describe("cache", () => {
    beforeEach(() => {
        client.reset();
    });

    afterEach(() => {
        client.cache.stop();
    });

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
        chai.expect(response.statusText).to.equal("Pulled from internal cache.");
        chai.expect(response.cache.hit).to.be.true;
        chai.expect(response.cache.stored).to.be.false;
        chai.expect(response.cache.pulled).to.be.true;
        chai.expect(response.cache.key).to.be.a("string");
    });

    it("should cache bust responses", async () => {
        client.configure({
            cache: {
                enabled: true,
                ttl: 100
            }
        });

        await client.get(`${SERVER_URL}/text`);

        await new Promise((resolve) => {
            setTimeout(resolve, 500);
        });

        const response = await client.get(`${SERVER_URL}/text`);

        chai.expect(response.data).to.equal("This is a text response.");
        chai.expect(response.status).to.equal(200);
        chai.expect(response.statusText).to.equal("OK");
        chai.expect(response.cache.hit).to.be.true;
        chai.expect(response.cache.stored).to.be.true;
        chai.expect(response.cache.pulled).to.be.null;
        chai.expect(response.cache.key).to.be.a("string");
    });

    it("should not access the cache if disabled after a request", async () => {
        client.configure({
            cache: {
                enabled: true
            }
        });

        client.get(`${SERVER_URL}/text`);

        client.configure({
            cache: {
                enabled: false
            }
        });

        const response = await client.get(`${SERVER_URL}/text`);

        chai.expect(response.data).to.equal("This is a text response.");
        chai.expect(response.status).to.equal(200);
        chai.expect(response.statusText).to.equal("OK");
        chai.expect(response.cache.hit).to.be.false;
        chai.expect(response.cache.stored).to.be.null;
        chai.expect(response.cache.pulled).to.be.null;
        chai.expect(response.cache.key).to.be.null;
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

    it("pipeline executors should be able to control the cache", async () => {
        client.configure({
            cache: {
                enabled: false
            }
        });

        const response1 = await client.get(`${SERVER_URL}/text`);

        chai.expect(response1.cache.stored).to.be.null;
        chai.expect(response1.cache.hit).to.be.false;

        const response2 = await client.get(`${SERVER_URL}/text`, {
            pipelines: {
                request: [
                    new PipelineExecutor((config) => {
                        config.cache.enabled = true;

                        return Promise.resolve(config);
                    })
                ]
            }
        });

        chai.expect(response2.cache.pulled).to.be.null;
        chai.expect(response2.cache.hit).to.be.true;
    });
});
