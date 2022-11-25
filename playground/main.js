const REQUEST_METHOD = document.getElementById("request_method");
const REQUEST_URL = document.getElementById("request_url");
const REQUEST_SEND = document.getElementById("request_send");
const REQUEST_BODY = document.getElementById("request_body");
const RESPONSE_TYPE = document.getElementById("response_type");

const REQUEST_CONTAINER = document.getElementById("urbex_requests");
const REQUEST_MODAL = document.getElementById("request_modal");

const REQUEST_BODY_METHODS = ["POST", "PUT", "PATCH"];
const REQUESTS = [];

const DEFAULT_URL = "http://localhost:8080/200";

const REQUEST_COLORS = {
    GET: {
        background: "bg-emerald-500",
        border: "border-emerald-500",
        text: "text-emerald-500"
    },
    POST: {
        background: "bg-blue-500",
        border: "border-blue-500",
        text: "text-blue-500"
    },
    PUT: {
        background: "bg-yellow-500",
        border: "border-yellow-500",
        text: "text-yellow-500"
    },
    PATCH: {
        background: "bg-orange-500",
        border: "border-orange-500",
        text: "text-orange-500"
    },
    DELETE: {
        background: "bg-red-500",
        border: "border-red-500",
        text: "text-red-500"
    },
    OPTIONS: {
        background: "bg-slate-500",
        border: "border-slate-500",
        text: "text-slate-500"
    },
    HEAD: {
        background: "bg-neutral-500",
        border: "border-neutral-500",
        text: "text-neutral-500"
    },
    ERROR: {
        background: "bg-red-500",
        border: "border-red-500",
        text: "text-red-500"
    }
};

let isLoading = false;

function createRequestItem(
    { id, method, url, responseType, statusText, status, timestamp },
    isError
) {
    const color = isError ? REQUEST_COLORS.ERROR : REQUEST_COLORS[method];

    return `
        <div
            id="${id}"
            class="relative bg-zinc-800 px-[8px] py-[8px] shadow-md w-full rounded-sm border-l-4 ${
                color.border
            }"
        >
            <div
                class="flex flex-row gap-[8px] text-white text-sm font-semibold items-center"
            >
                <div class="flex-none ${color.background} rounded-sm px-[14px] py-[4px]">
                    <h1 class="font-bold text-md">${method}</h1>
                </div>
                <div class="flex-auto w-[50%]">
                    <h1 class="text-white font-bold text-md truncate">${url}</h1>
                </div>
                <div class="flex-grow gap-[8px] flex flex-row items-center justify-end">
                    <h1 class="font-bold">${responseType.toUpperCase()}</h1>
                    <h1 class="font-bold text-md ${color.text}">${status}</h1>
                    <h1 class="font-bold text-md text-white">${statusText}</h1>
                    <h1 class="font-normal text-slate-300">${timestamp}</h1>
                </div>
                <div
                    class="p-[2px] rounded-sm bg-neutral-800 cursor-pointer hover:bg-zinc-700"
                    id="view_request"
                    request_id="${id}"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 pointer-events-none"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    `;
}

function createRequestWidget(title, content) {
    let isObject = false;

    if (typeof content === "object" && content !== null) {
        content = JSON.stringify(content, null, 2);
        isObject = true;
    }

    return `
        <div class="relative block bg-zinc-900 px-[8px] py-[4px] rounded-md shadow-md">
            <div class="mb-[6px] pb-[6px] border-b-[1px] border-zinc-300">
                <h1 class="text-white font-semibold text-md">${title}</h1>
            </div>
            <div class="min-h-[84px] ${
                !isObject ? "flex justify-center items-center" : ""
            } max-h-[280px] overflow-auto">
                ${
                    isObject
                        ? `<pre class="text-white font-bold text-[16px] break-all whitespace-pre p-[15px]">${content}</pre>`
                        : `<p class="text-white font-bold text-[24px]">${content}</p>`
                }
            </div>
        </div>
    `;
}

function createModalOverview(request) {
    return `
        <div class="px-[32px] w-[1200px] z-[1] mx-auto my-[32px]">
            <div class="relative w-full flex justify-end">
                <div class="text-white cursor-pointer" onclick="closeModal()">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>
            </div>

            <div class="relative grid grid-cols-3 gap-4 my-[12px]">
                ${createRequestWidget("Status", request.status)}
                ${createRequestWidget("Status Text", request.statusText)}
                ${createRequestWidget("Duration", request.duration)}
                ${createRequestWidget("Timestamp", request.timestamp)}
                ${createRequestWidget("Response Type", request.responseType)}
                ${createRequestWidget("Cache", request.cache)}
            </div>
            <div class="relative grid grid-cols-1 gap-4 my-[12px]">
                ${createRequestWidget("Data", request.data)}
            </div>
            <div class="relative grid grid-cols-2 gap-4 my-[12px]">
                ${createRequestWidget("Config", request.config)}
                ${createRequestWidget("Headers", request.headers)}
            </div>
            <div class="relative grid grid-cols-2 gap-4 my-[12px]">
                ${createRequestWidget("Request", request.request)}
                ${createRequestWidget("Response", request.response)}
            </div>
        </div>
    `;
}

function closeModal() {
    REQUEST_MODAL.classList.add("hidden");
    REQUEST_MODAL.innerHTML = "";
}

async function onSend() {
    if (isLoading) {
        return false;
    }

    const method = REQUEST_METHOD.value;
    const url = REQUEST_URL.value;
    const body = REQUEST_BODY.querySelector("textarea").value;
    const responseType = RESPONSE_TYPE.value;

    const request = {
        url: url,
        method: method,
        responseType: responseType
    };

    if (body && body.length) {
        request.data = body;
    }

    const id = `request_${Math.floor(Math.random() * 1000000)}`;

    REQUEST_SEND.classList.add("cursor-wait");

    try {
        isLoading = true;
        const response = await urbex.send(request);

        REQUESTS.push([id, response]);
    } catch (error) {
        const response = {
            status: error.status,
            statusText: error.message,
            headers: {},
            data: error.response?.data ?? null,
            config: error.config,
            request: error.request,
            response: error.response,
            duration: null,
            timestamp: new Date().toISOString(),
            cache: {},
            responseType: request.responseType
        };

        REQUESTS.push([id, response, true]);
    } finally {
        renderRequests();
        isLoading = false;
        REQUEST_SEND.classList.remove("cursor-wait");
    }
}

function onMethodSelect(e) {
    if (REQUEST_BODY_METHODS.includes(e.target.value)) {
        REQUEST_BODY.style.display = "block";
    } else {
        REQUEST_BODY.style.display = "none";
    }
}

function newRequestElement(id, request, isError) {
    const requestElement = createRequestItem(
        {
            id: id,
            method: request.config.method,
            url: request.config.url.href,
            responseType: request.responseType,
            status: request.status,
            statusText: request.statusText,
            timestamp: request.timestamp
        },
        isError
    );

    return REQUEST_CONTAINER.insertAdjacentHTML("afterbegin", requestElement);
}

function renderRequests() {
    if (REQUESTS.length) {
        REQUEST_CONTAINER.innerHTML = "";
        for (const request of REQUESTS) {
            const [id, requestObject, isError] = request;
            newRequestElement(id, requestObject, isError);
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

// add an onclick event listener to the view request button
document.addEventListener("click", (e) => {
    if (e.target.id === "view_request") {
        const request_id = e.target.getAttribute("request_id");
        const request = REQUESTS.find((request) => request[0] === request_id)[1];

        const requestModal = createModalOverview(request);

        REQUEST_MODAL.insertAdjacentHTML("beforeend", requestModal);
        REQUEST_MODAL.classList.remove("hidden");
    }
});
