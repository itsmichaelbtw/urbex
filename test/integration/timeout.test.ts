import chai from "chai";

import { SERVER_URL } from "../constants";

import urbex from "../../lib/urbex";

const client = urbex.isolateClient();

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
