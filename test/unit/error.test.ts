import chai from "chai";

import { UrbexError, TimeoutError, PipelineError, NetworkError } from "../../lib/core/error";

const errorInstanceBinding = {
    config: {
        entry: "my-config"
    },
    request: {
        entry: "my-request"
    }
};

describe("errors (unit)", () => {
    it("should return true if the input is an instance of `UrbexError`", () => {
        chai.expect(UrbexError.isInstance(new UrbexError())).to.be.true;
        chai.expect(UrbexError.isInstance(new TimeoutError())).to.be.true;
        chai.expect(UrbexError.isInstance(new PipelineError())).to.be.true;
        chai.expect(UrbexError.isInstance(new NetworkError())).to.be.true;
        chai.expect(UrbexError.isInstance(new Error())).to.be.false;
    });

    it("should create an instance of `UrbexError`", () => {
        const error = new UrbexError("My Custom Error");

        chai.expect(error).to.be.an.instanceOf(UrbexError);
        chai.expect(error.name).to.equal("UrbexError");
        chai.expect(error.message).to.equal("My Custom Error");
    });

    it("should create an instance of `TimeoutError`", () => {
        const error = new TimeoutError("A timeout error occurred");

        chai.expect(error).to.be.an.instanceOf(TimeoutError);
        chai.expect(error.name).to.equal("TimeoutError");
        chai.expect(error.message).to.equal("A timeout error occurred");
    });

    it("should create an instance of `PipelineError`", () => {
        const error = new PipelineError("A pipeline error occurred");

        chai.expect(error).to.be.an.instanceOf(PipelineError);
        chai.expect(error.name).to.equal("PipelineError");
        chai.expect(error.message).to.equal("A pipeline error occurred");
    });

    it("should create an instance of `NetworkError`", () => {
        const error = new NetworkError("A network error occurred");

        chai.expect(error).to.be.an.instanceOf(NetworkError);
        chai.expect(error.name).to.equal("NetworkError");
        chai.expect(error.message).to.equal("A network error occurred");
    });

    it("should default the message if no none is provided", () => {
        const error = new UrbexError();

        chai.expect(error.message).to.equal("An error occurred while executing a request.");
    });

    it("should create an error from another error instance", () => {
        const timeoutError: TimeoutError = UrbexError.createErrorInstance.call(
            errorInstanceBinding,
            TimeoutError
        );

        const pipelineError: PipelineError = UrbexError.createErrorInstance.call(
            errorInstanceBinding,
            PipelineError
        );

        const networkError: NetworkError = UrbexError.createErrorInstance.call(
            errorInstanceBinding,
            NetworkError
        );

        chai.expect(timeoutError).to.be.an.instanceOf(TimeoutError);
        chai.expect(pipelineError).to.be.an.instanceOf(PipelineError);
        chai.expect(networkError).to.be.an.instanceOf(NetworkError);

        chai.expect(timeoutError.name).to.equal("TimeoutError");
        chai.expect(pipelineError.name).to.equal("PipelineError");
        chai.expect(networkError.name).to.equal("NetworkError");

        chai.expect(timeoutError.message).to.equal("The request timed out.");
        chai.expect(pipelineError.message).to.equal(
            "An error occurred while executing a pipeline."
        );
        chai.expect(networkError.message).to.equal("Failed to request the resource.");
    });

    it("should create an error instance from an error", () => {
        const errorInstance: UrbexError = UrbexError.createFromError.call(
            UrbexError,
            new Error("My Custom Error")
        );

        chai.expect(errorInstance).to.be.an.instanceOf(UrbexError);
        chai.expect(errorInstance.name).to.equal("UrbexError");
        chai.expect(errorInstance.message).to.equal("My Custom Error");
    });

    it("should return the error instance as JSON", () => {
        const error: UrbexError = UrbexError.createErrorInstance.call(
            errorInstanceBinding,
            UrbexError
        );

        error.response = {
            entry: "my-response"
        } as any;
        error.status = 500;
        error.stack = "my-stack";

        const asJson = error.toJSON();

        chai.expect(asJson).to.deep.equal({
            config: {
                entry: "my-config"
            },
            message: "An error occurred while executing a request.",
            name: "UrbexError",
            request: {
                entry: "my-request"
            },
            response: {
                entry: "my-response"
            },
            status: 500,
            stack: "my-stack"
        });
    });
});
