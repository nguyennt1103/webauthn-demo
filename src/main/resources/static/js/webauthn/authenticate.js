import {post} from "../http.js";
import {resetPopups, setError} from "./pop-up.js";

(async () => {
    resetPopups();

    if (!window.PublicKeyCredential) {
        setError("WebAuthn is not supported");
        return;
    }

    document.getElementById("authenticate").addEventListener("click", async () => {
        await authenticateOnError();
    });
})();

async function authenticateOnError() {
    try {
        const pkCredRequestOptions = await getRequestOptions();
        window.location.href = await verifyCredential(pkCredRequestOptions);
    } catch (e) {
        console.error(e);
        setError(e.message);
    }
}

async function getRequestOptions() {
    // get spring security request options
    const optionsResponse = await post("/webauthn/authenticate/options");

    // check error
    if (!optionsResponse.ok) {
        throw new Error("Failed to get request options");
    }

    // parse json
    const optionsJson = await optionsResponse.json();

    // WebAuthn parsing support
    if (!PublicKeyCredential.parseRequestOptionsFromJSON) {
        throw new Error("WebAuthn browser does not support function parseRequestOptionsFromJSON");
    }
    return PublicKeyCredential.parseRequestOptionsFromJSON(optionsJson);
}

async function verifyCredential(pkCredRequestOptions) {
    let credential;
    // call navigator.credentials.get
    try {
        credential = await navigator.credentials.get({
            publicKey: pkCredRequestOptions
        });
    } catch (e) {
        throw new Error(`Authentication failed. Call to navigator.credentials.get failed: ${e.message}`);
    }

    if (!credential.toJSON) {
        throw new Error("WebAuthn browser does not support function PublicKeyCredentialRequestOptions.toJSON")
    }

    // base64url parse
    const credentialJson = credential.toJSON();

    const verificationResponse = await post("/login/webauthn", {}, credentialJson);

    if (!verificationResponse.ok) {
        throw new Error("Failed to authenticate the credential");
    }

    const verificationJson = await verificationResponse.json();

    if (!(verificationJson && verificationJson.authenticated && verificationJson.redirectUrl)) {
        throw new Error("Authentication process is failure");
    }

    return verificationJson.redirectUrl;
}
