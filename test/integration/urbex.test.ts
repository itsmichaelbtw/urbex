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

    it("should treat endpoints as a url", async () => {
        client.configure({ url: SERVER_URL });
        const response = await client.get("/200");

        chai.expect(response.status).to.equal(200);
    });

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

    describe("maxContentLength", () => {});

    describe("responseType", () => {});

    describe("responseEncoding", () => {});
});
