const authenticateBtn = document.getElementById("authenticate");
authenticateBtn.addEventListener("click", async () => {
    // setup csrf value and header
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

    // get spring security request options
    const optionsResponse = await fetch("/webauthn/authenticate/options", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            [csrfHeader]: csrfToken
        }
    });

    // check error
    if (!optionsResponse.ok) {
        throw new Error("Failed to get request options");
    }

    // parse json
    const optionsJson = await optionsResponse.json();

    // WebAuthn parsing support
    const pkCredRequestOptions = PublicKeyCredential.parseRequestOptionsFromJSON(optionsJson);

    // call navigator.credentials.get
    const credential = await navigator.credentials.get({
        publicKey: pkCredRequestOptions
    });

    // base64url parse
    const credentialJson = credential.toJSON();

    // send the credential to the server
    const verificationResponse = await fetch("/login/webauthn", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify(credentialJson)
    });

    if (!verificationResponse.ok) {
        throw new Error("Failed to authenticate the credential");
    }

    const verificationJson = await verificationResponse.json();
    console.log(verificationJson)

    if (!(verificationJson && verificationJson.authenticated && verificationJson.redirectUrl)) {
        throw new Error("Authentication process is failure");
    }

    window.location.href = verificationJson.redirectUrl;
});