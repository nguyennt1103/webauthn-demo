export async function post(url, headers, body) {
    // setup csrf value and header
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            [csrfHeader]: csrfToken,
            ...headers
        }
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    return fetch(url, options);
}
