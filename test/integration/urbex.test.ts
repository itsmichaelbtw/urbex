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

    it("should perform OPTIONS and HEAD requests", async () => {
        const url = `${SERVER_URL}/200`;

        const [header, options, headSend, optionsSend] = await Promise.all([
            client.head(url),
            client.options(url),
            client.send({
                method: "HEAD",
                url: url
            }),
            client.send({
                method: "OPTIONS",
                url: url
            })
        ]);

        chai.expect(header.status).to.equal(200);
        chai.expect(options.status).to.equal(200);
        chai.expect(headSend.status).to.equal(200);
        chai.expect(optionsSend.status).to.equal(200);
    });

    it("the configuration should be attached to the response", async () => {
        const url = `${SERVER_URL}/200`;

        client.configure({
            url: url,
            method: "post",
            headers: {
                "X-Test": "test",
                foo: "bar",
                bar: "foo"
            },
            resolveStatus: (config, status) => status === 200
        });

        const response = await client.send();

        chai.expect(response.config).to.deep.equal(client.config);
    });

    it("should treat pathnames as a url", async () => {
        client.configure({ url: SERVER_URL });
        const response = await client.get("/200");

        chai.expect(response.status).to.equal(200);
        chai.expect(response.config.url.href).to.equal(`${SERVER_URL}/200`);
        chai.expect(response.config.url.pathname).to.equal("/200");
    });

    it("should allow full urls when using alias", async () => {
        const response = await client.get(`${SERVER_URL}/200`);

        chai.expect(response.status).to.equal(200);
        chai.expect(response.config.url.href).to.equal(`${SERVER_URL}/200`);
        chai.expect(response.config.url.pathname).to.equal("/200");

        const response2 = await client.get({
            href: `${SERVER_URL}/200`
        });

        chai.expect(response2.status).to.equal(200);
        chai.expect(response2.config.url.href).to.equal(`${SERVER_URL}/200`);
        chai.expect(response2.config.url.pathname).to.equal("/200");
    });

    it("should fall back on default configuration if no config is passed", async () => {
        client.configure({
            url: {
                origin: SERVER_URL,
                pathname: "/200"
            },
            headers: {
                "X-Test": "test"
            }
        });

        const response = await client.send();

        chai.expect(response.status).to.equal(200);
        chai.expect(response.config.url.href).to.equal(`${SERVER_URL}/200`);
        chai.expect(response.config.url.pathname).to.equal("/200");
        chai.expect(response.config.headers.getAll()).to.have.property("X-Test");
    });

    it("should preserve existing headers when null or undefined is passed", async () => {
        client.configure({
            url: {
                origin: SERVER_URL,
                pathname: "/200"
            },
            headers: {
                "X-Test": "test"
            }
        });

        const response = await client.send({
            headers: {
                "X-Test2": null,
                "X-Test3": undefined
            }
        });

        chai.expect(response.status).to.equal(200);
        chai.expect(response.config.url.href).to.equal(`${SERVER_URL}/200`);
        chai.expect(response.config.url.pathname).to.equal("/200");
        chai.expect(response.config.headers.getAll()).to.have.property("X-Test");
        chai.expect(response.config.headers.getAll()).to.not.have.property("X-Test2");
        chai.expect(response.config.headers.getAll()).to.not.have.property("X-Test3");
    });

    it("should allow lowercase and uppercase methods", async () => {
        const url = `${SERVER_URL}/200`;

        const [lowercase, uppercase, funnycase] = await Promise.all([
            client.send({
                method: "get",
                url: url
            }),
            client.send({
                method: "GET",
                url: url
            }),
            client.send({
                // @ts-expect-error
                method: "GeT",
                url: url
            })
        ]);

        chai.expect(lowercase.status).to.equal(200);
        chai.expect(uppercase.status).to.equal(200);
        chai.expect(funnycase.status).to.equal(200);

        chai.expect(lowercase.config.method).to.equal("GET");
        chai.expect(uppercase.config.method).to.equal("GET");
        chai.expect(funnycase.config.method).to.equal("GET");
    });

    it("should default to 'GET' requests", async () => {
        const response = await client.send({
            url: `${SERVER_URL}/200`
        });

        chai.expect(response.status).to.equal(200);
        chai.expect(response.config.method).to.equal("GET");
    });

    it("should make request without a HTTP alias", async () => {
        const response = await client.send({
            method: "POST",
            url: `${SERVER_URL}/200`
        });

        chai.expect(response.status).to.equal(200);
        chai.expect(response.config.method).to.equal("POST");
    });
});
