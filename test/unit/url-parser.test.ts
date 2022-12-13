import chai from "chai";

import { SERVER_URL } from "../constants";

import urbex, { URLParser, URLComponent } from "../../lib/urbex";

type PartialComponent = Partial<URLComponent>;

const parser = new URLParser(SERVER_URL);

describe("url-parser", () => {
    it("should parse a component (static)", () => {
        const component = URLParser.parse("https://example.com");

        chai.expect(component).to.be.an("object");
        chai.expect(component.href).to.equal("https://example.com");
        chai.expect(component.origin).to.equal("https://example.com");
        chai.expect(component.protocol).to.equal("https");
        chai.expect(component.username).to.equal("");
        chai.expect(component.password).to.equal("");
        chai.expect(component.hostname).to.equal("example.com");
        chai.expect(component.port).to.equal("");
        chai.expect(component.pathname).to.equal("");
        chai.expect(component.search).to.equal("");
        chai.expect(component.hash).to.equal("");
    });

    it("should serialize a component (serialize)", () => {
        const component = URLParser.parse("https://example.com");

        chai.expect(URLParser.serialize(component.toJSON())).to.equal("https://example.com");
    });

    it("should have public methods and properties", () => {
        chai.expect(URLParser).to.be.a("function");
        chai.expect(URLParser).to.have.property("parse");
        chai.expect(URLParser).to.have.property("serialize");

        const url = new URLParser();

        chai.expect(url).to.be.an.instanceof(URLParser);
        chai.expect(url).to.have.property("set");
        chai.expect(url).to.have.property("href");
        chai.expect(url).to.have.property("origin");
        chai.expect(url).to.have.property("protocol");
        chai.expect(url).to.have.property("username");
        chai.expect(url).to.have.property("password");
        chai.expect(url).to.have.property("hostname");
        chai.expect(url).to.have.property("port");
        chai.expect(url).to.have.property("pathname");
        chai.expect(url).to.have.property("search");
        chai.expect(url).to.have.property("hash");
        chai.expect(url).to.have.property("setSearchParams");
        chai.expect(url).to.have.property("toString");
        chai.expect(url).to.have.property("toJSON");
        chai.expect(url).to.have.property("parse");
        chai.expect(url).to.have.property("serialize");
    });

    it("should return the input as an object", () => {
        const url = new URLParser("https://example.com");

        const output = url.toJSON();

        chai.expect(output).to.be.an("object");
        chai.expect(output.href).to.equal("https://example.com");
        chai.expect(output.origin).to.equal("https://example.com");
        chai.expect(output.protocol).to.equal("https");
        chai.expect(output.username).to.equal("");
        chai.expect(output.password).to.equal("");
        chai.expect(output.hostname).to.equal("example.com");
        chai.expect(output.port).to.equal("");
        chai.expect(output.pathname).to.equal("");
        chai.expect(output.search).to.equal("");
        chai.expect(output.hash).to.equal("");
    });

    it("should return the input as a string", () => {
        const url = new URLParser("https://example.com/?search#hash");

        const output = url.toString();

        chai.expect(output).to.be.a("string");
        chai.expect(output).to.equal("https://example.com/?search#hash");
    });

    it("using `set()` should set the component", () => {
        const component: PartialComponent = {
            href: "https://example.com:8080/pathname?foo=bar",
            origin: "https://example.com:8080",
            protocol: "https",
            hostname: "example.com",
            port: "8080",
            pathname: "/pathname",
            searchParams: new URLSearchParams("foo=bar")
        };

        const url = new URLParser();

        url.set(component);

        chai.expect(url.href).to.equal("https://example.com:8080/pathname?foo=bar");
        chai.expect(url.origin).to.equal("https://example.com:8080");
        chai.expect(url.protocol).to.equal("https");
        chai.expect(url.hostname).to.equal("example.com");
        chai.expect(url.port).to.equal("8080");
        chai.expect(url.pathname).to.equal("/pathname");
        chai.expect(url.search).to.equal("?foo=bar");
    });

    describe("when parsing", () => {
        it("should parse an url into a component object", () => {
            const url = new URLParser("https://example.com:8080/path?foo=bar#hash");

            chai.expect(url).to.be.an.instanceof(URLParser);

            const component = url.toJSON();

            chai.expect(component).to.be.an("object");
            chai.expect(component.href).to.equal("https://example.com:8080/path?foo=bar#hash");
            chai.expect(component.origin).to.equal("https://example.com:8080");
            chai.expect(component.protocol).to.equal("https");
            chai.expect(component.username).to.equal("");
            chai.expect(component.password).to.equal("");
            chai.expect(component.hostname).to.equal("example.com");
            chai.expect(component.port).to.equal(8080);
            chai.expect(component.pathname).to.equal("/path");
            chai.expect(component.search).to.equal("?foo=bar");
            chai.expect(component.hash).to.equal("#hash");
        });

        it("should allow data uri's as input", () => {
            const url = new URLParser("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D");

            chai.expect(url.href).to.equal("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D");
            chai.expect(url.origin).to.equal("null");
            chai.expect(url.protocol).to.equal("data");
            chai.expect(url.username).to.equal("");
            chai.expect(url.password).to.equal("");
            chai.expect(url.hostname).to.equal("");
            chai.expect(url.pathname).to.equal("text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D");
        });

        it("should throw an error if the input is not a string or object", () => {
            chai.expect(() => new URLParser(1 as any)).to.throw(
                TypeError,
                "Invalid input. Must be a string or an object."
            );
        });

        it("should ignore multiple delimiters between url components", () => {
            const url = new URLParser("https://///example.com////path/?foo=bar&&###hash");

            chai.expect(url.href).to.equal("https://///example.com////path/?foo=bar&&###hash");
            chai.expect(url.origin).to.equal("https://example.com");
            chai.expect(url.protocol).to.equal("https");
            chai.expect(url.username).to.equal("");
            chai.expect(url.password).to.equal("");
            chai.expect(url.hostname).to.equal("example.com");
            chai.expect(url.port).to.equal("");
            chai.expect(url.pathname).to.equal("/path/");
            chai.expect(url.search).to.equal("?foo=bar&&");
            chai.expect(url.hash).to.equal("#hash");
        });

        it("should parse a url with a username and password", () => {
            const url = new URLParser("https://username:password@example.com");

            chai.expect(url.href).to.equal("https://username:password@example.com");
            chai.expect(url.username).to.equal("username");
            chai.expect(url.password).to.equal("password");
        });

        it("should parse a url with a username and no password", () => {
            const url = new URLParser("https://username@example.com");

            chai.expect(url.href).to.equal("https://username@example.com");
            chai.expect(url.username).to.equal("username");
        });

        it("should throw an error if a password is provided without a username", () => {
            chai.expect(() => new URLParser("https://:password@example.com")).to.throw(Error);
        });

        it("should default // to http://", () => {
            const url = new URLParser("//example.com");

            chai.expect(url.href).to.equal("//example.com");
            chai.expect(url.protocol).to.equal("http");
        });

        it("should parse ipv4 addresses", () => {
            const url = new URLParser("https://192.168.0.1");

            chai.expect(url.href).to.equal("https://192.168.0.1");
            chai.expect(url.hostname).to.equal("192.168.0.1");
        });

        it("should throw an error if the ipv4 address is incorrect", () => {
            chai.expect(() => new URLParser("https://600.168.0.1")).to.throw(Error);
        });

        it("should parse ipv6 addresses", () => {
            const url = new URLParser("https://[2001:db8:0:0:1:0:0:1]");

            chai.expect(url.href).to.equal("https://[2001:db8:0:0:1:0:0:1]");
            chai.expect(url.hostname).to.equal("[2001:db8:0:0:1:0:0:1]");
        });

        it("should parse urns", () => {
            const url = new URLParser("urn:isbn:0451450523");

            chai.expect(url.href).to.equal("urn:isbn:0451450523");
            chai.expect(url.protocol).to.equal("urn");
            chai.expect(url.pathname).to.equal("isbn:0451450523");
        });

        it("should parse ws urls", () => {
            const url = new URLParser("ws://example.com");

            chai.expect(url.href).to.equal("ws://example.com");
            chai.expect(url.protocol).to.equal("ws");
        });
    });

    describe("when serializing", () => {
        it("should serialize an object into a string", () => {
            const component: PartialComponent = {
                protocol: "https",
                username: "username",
                password: "password",
                hostname: "example.com",
                pathname: "/my-pathname"
            };

            const url = new URLParser(component);

            chai.expect(url.href).to.equal("https://username:password@example.com/my-pathname");
            chai.expect(url.origin).to.equal("https://example.com");
            chai.expect(url.protocol).to.equal("https");
            chai.expect(url.username).to.equal("username");
            chai.expect(url.password).to.equal("password");
            chai.expect(url.hostname).to.equal("example.com");
        });

        it("the href should take precedence over other properties (constructor)", () => {
            const component: PartialComponent = {
                href: "https://example.com/my-pathname",
                protocol: "http",
                username: "username",
                password: "password",
                hostname: "example.com",
                pathname: "/my-pathname"
            };

            const url = new URLParser(component);

            chai.expect(url.href).to.equal("https://example.com/my-pathname");
            chai.expect(url.origin).to.equal("https://example.com");
            chai.expect(url.protocol).to.equal("https");
            chai.expect(url.username).to.equal("");
            chai.expect(url.password).to.equal("");
            chai.expect(url.hostname).to.equal("example.com");
        });

        it("the href should not take precedence when calling serialize()", () => {
            const component: PartialComponent = {
                href: "https://example.com/my-pathname",
                protocol: "http",
                username: "username",
                password: "password",
                hostname: "example.com",
                pathname: "/my-pathname"
            };

            const parser = new URLParser();
            parser.serialize(component);

            const url = parser.toJSON();

            chai.expect(url.href).to.equal("http://username:password@example.com/my-pathname");
        });

        it("the origin should take precedence over other properties", () => {
            const component: PartialComponent = {
                origin: "https://example.com:1234",
                protocol: "http",
                username: "username",
                password: "password",
                hostname: "google.com",
                port: 8080,
                pathname: "/my-pathname"
            };

            const url = new URLParser(component);

            chai.expect(url.href).to.equal(
                "https://username:password@example.com:1234/my-pathname"
            );
            chai.expect(url.origin).to.equal("https://example.com:1234");
            chai.expect(url.protocol).to.equal("https");
            chai.expect(url.username).to.equal("username");
            chai.expect(url.password).to.equal("password");
            chai.expect(url.hostname).to.equal("example.com");
            chai.expect(url.port).to.equal(1234);
            chai.expect(url.pathname).to.equal("/my-pathname");
        });

        it("the username and password should take precedence over the auth provided in the origin", () => {
            const component: PartialComponent = {
                origin: "https://user:pass@example.com",
                protocol: "http",
                username: "username",
                password: "password"
            };

            const url = new URLParser(component);

            chai.expect(url.href).to.equal("https://username:password@example.com");
            chai.expect(url.username).to.equal("username");
            chai.expect(url.password).to.equal("password");
        });

        it("should throw an error if no protocol and hostname is provided", () => {
            const component: PartialComponent = {
                pathname: "/my-pathname"
            };

            chai.expect(() => new URLParser(component)).to.throw(Error);
        });

        it("should convert search to URLSearchParams", () => {
            const component: PartialComponent = {
                protocol: "https",
                hostname: "example.com",
                search: "?foo=bar"
            };

            const url = new URLParser(component);

            chai.expect(url.searchParams).to.be.instanceOf(URLSearchParams);
            chai.expect(url.searchParams.get("foo")).to.equal("bar");
            chai.expect(url.search).to.equal("?foo=bar");
        });
    });

    describe("when setting", () => {
        it("the href should re-parse the component", () => {
            chai.expect(parser.href).to.equal(SERVER_URL);

            parser.pathname = "/foo";
            parser.href = "https://example.com";

            chai.expect(parser.href).to.equal("https://example.com");
            chai.expect(parser.pathname).to.equal("");
        });

        it("the origin should override the protocol, hostname and port", () => {
            parser.serialize({
                protocol: "https",
                hostname: "httpbin.org",
                port: 8080,
                pathname: "/path",
                search: "foo=bar",
                hash: "hash"
            });

            parser.origin = "http://localhost:1234";

            chai.expect(parser.href).to.equal("http://localhost:1234/path?foo=bar#hash");
            chai.expect(parser.origin).to.equal("http://localhost:1234");
            chai.expect(parser.protocol).to.equal("http");
            chai.expect(parser.hostname).to.equal("localhost");
            chai.expect(parser.port).to.equal(1234);
            chai.expect(parser.pathname).to.equal("/path");
            chai.expect(parser.search).to.equal("?foo=bar");
            chai.expect(parser.hash).to.equal("#hash");
        });

        it("the protocol should update correctly", () => {
            parser.parse("http://example.com");

            parser.protocol = "my-protocol";

            chai.expect(parser.href).to.include("my-protocol");
            chai.expect(parser.origin).to.include("my-protocol");
            chai.expect(parser.protocol).to.equal("my-protocol");
        });

        it("the username should update correctly", () => {
            parser.parse("http://my-username@example.com");

            parser.username = "user";

            chai.expect(parser.href).to.include("user");
            chai.expect(parser.username).to.equal("user");
        });

        it("the password should update correctly", () => {
            parser.parse("http://my-username:my-password@example.com");

            parser.password = "pass";

            chai.expect(parser.href).to.include("pass");
            chai.expect(parser.password).to.equal("pass");
        });

        it("the password without a username should throw an error", () => {
            parser.parse("http://example.com");

            chai.expect(() => (parser.password = "pass")).to.throw(Error);
        });

        it("the hostname should update correctly", () => {
            parser.parse("http://example.com");

            parser.hostname = "google.com";

            chai.expect(parser.href).to.include("google.com");
            chai.expect(parser.origin).to.include("google.com");
            chai.expect(parser.hostname).to.equal("google.com");
        });

        it("the port should update correctly", () => {
            parser.parse("http://example.com:8080");

            parser.port = 1234;

            chai.expect(parser.href).to.include(":1234");
            chai.expect(parser.origin).to.include(":1234");
            chai.expect(parser.port).to.equal(1234);
        });

        it("the pathname should update correctly", () => {
            parser.parse("http://example.com/my-pathname");

            parser.pathname = "/foo";

            chai.expect(parser.href).to.include("/foo");
            chai.expect(parser.pathname).to.equal("/foo");
        });

        it("the search should update correctly", () => {
            parser.parse("http://example.com?foo=bar");

            chai.expect(parser.search).to.equal("?foo=bar");
            chai.expect(parser.searchParams.get("foo")).to.equal("bar");

            parser.setSearchParams("foo=bar&bar=baz");

            chai.expect(parser.search).to.equal("?foo=bar&bar=baz");
            chai.expect(parser.searchParams.get("foo")).to.equal("bar");

            parser.setSearchParams({
                "my-foo": "my-bar",
                "my-bar": "my-baz"
            });

            chai.expect(parser.search).to.equal("?my-foo=my-bar&my-bar=my-baz");
            chai.expect(parser.searchParams.get("my-foo")).to.equal("my-bar");
            chai.expect(parser.searchParams.get("my-bar")).to.equal("my-baz");

            parser.setSearchParams([
                ["key1", "value1"],
                ["key2", "value2"]
            ]);

            chai.expect(parser.search).to.equal("?key1=value1&key2=value2");
            chai.expect(parser.searchParams.get("key1")).to.equal("value1");
            chai.expect(parser.searchParams.get("key2")).to.equal("value2");

            parser.setSearchParams(new URLSearchParams("key3=value3&key4=value4"));

            chai.expect(parser.search).to.equal("?key3=value3&key4=value4");
            chai.expect(parser.searchParams.get("key3")).to.equal("value3");
            chai.expect(parser.searchParams.get("key4")).to.equal("value4");
        });

        it("the hash should update correctly", () => {
            parser.parse("http://example.com#hash");

            parser.hash = "foo";

            chai.expect(parser.href).to.include("#foo");
            chai.expect(parser.hash).to.equal("#foo");
        });
    });
});
