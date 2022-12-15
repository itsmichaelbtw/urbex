import chai from "chai";

import { PORT, SERVER_URL } from "../constants";

import urbex, { PipelineExecutor } from "../../lib/urbex";

const client = urbex.isolateClient();

describe("resolve-request", () => {
    beforeEach(() => {
        client.reset();
    });

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
                chai.expect(config.headers.get("chai")).to.equal("expect");
                return status >= 200 && status < 300;
            }
        });

        const response = await client.get(`${SERVER_URL}/200`);

        chai.expect(response.status).to.equal(200);
    });
});
