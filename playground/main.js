const REQUEST_METHOD = document.getElementById("request_method");
const REQUEST_URL = document.getElementById("request_url");
const REQUEST_SEND = document.getElementById("request_send");
const REQUEST_BODY = document.getElementById("request_body");

const REQUEST_CONTAINER = document.getElementById("urbex_requests");

const REQUEST_BODY_METHODS = ["POST", "PUT", "PATCH"];
const REQUESTS = [];

const DEFAULT_URL = "https://jsonplaceholder.typicode.com/posts/1";

async function onSend() {
    const method = REQUEST_METHOD.value;
    const url = REQUEST_URL.value;
    const body = REQUEST_BODY.value;

    const request = {
        url: url,
        method: method
    };

    if (body) {
        request.body = body;
    }

    const response = await urbex.send(request);

    REQUESTS.push(response);
}

function onMethodSelect(e) {
    if (REQUEST_BODY_METHODS.includes(e.target.value)) {
        REQUEST_BODY.style.display = "block";
    } else {
        REQUEST_BODY.style.display = "none";
    }
}

function newRequestElement(id, request) {
    const element = document.createElement("div");

    return `
        <div class="request">
            <div></div>
            <div class="request__id">${id}</div>
            <div class="request__data">${request}</div>
        </div>
    `;
}

function renderRequests() {
    if (REQUESTS.length) {
        for (const request of REQUESTS) {
        }
    } else {
        REQUEST_CONTAINER.innerHTML = `
            <div class="relative w-fit mx-auto">
                <p class="text-white text-md font-bold">No requests.</p>
            </div>
        `;
    }
}

renderRequests();

REQUEST_URL.value = DEFAULT_URL;

REQUEST_METHOD.onchange = onMethodSelect;
REQUEST_SEND.onclick = onSend;
