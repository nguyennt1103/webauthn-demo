import {post} from "../http.js";
import {resetPopups, setError, setSuccess} from "./pop-up.js";

(async () => {
    resetPopups();

    if (!window.PublicKeyCredential) {
        setError("WebAuthn is not supported");
        return;
    }

    document.getElementById("register").addEventListener("click", async () => {
        await registerOnError();
    });

})();

async function registerOnError() {
    try {
        const pkCredCreationOptions = await getRegistrationOptions();
        await registerCredential(pkCredCreationOptions);

        setSuccess("Registration success");
    } catch (e) {
        console.error(e);
        setError(e.message);
    }
}

async function registerCredential(pkCredCreationOptions) {
    let credential;

    try {
        // call navigator.credentials.create
        credential = await navigator.credentials.create({
            publicKey: pkCredCreationOptions
        });
    } catch (e) {
        throw new Error(`Register failed. Call to navigator.credentials.create failed: ${e.message}`);
    }

    if (!credential.toJSON) {
        throw new Error("WebAuthn browser does not support function PublicKeyCredentialCreationOptions.toJSON")
    }

    // base64url parse
    const credentialJson = credential.toJSON();

    // send the credential to the server
    const verificationResponse = await post("/webauthn/register", {}, {
        publicKey: {
            credential: credentialJson,
            label: "localhost"
        }
    });

    if (!verificationResponse.ok) {
        throw new Error("Failed to register a new credential");
    }

    const verificationJson = await verificationResponse.json();

    if (!(verificationJson && verificationJson.success)) {
        throw new Error("Registration process is failure");
    }
}

async function getRegistrationOptions() {
    // get spring security creation options
    const optionsResponse = await post("/webauthn/register/options");

    // check error
    if (!optionsResponse.ok) {
        throw new Error("Failed to get creation options");
    }

    // parse json
    const optionsJson = await optionsResponse.json();

    if (!PublicKeyCredential.parseCreationOptionsFromJSON) {
        throw new Error("WebAuthn browser does not support function parseCreationOptionsFromJSON")
    }

    return PublicKeyCredential.parseCreationOptionsFromJSON(optionsJson);
}
