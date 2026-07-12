import {post} from "../http.js";

const registerBtn = document.getElementById("register");
registerBtn.addEventListener("click", async () => {
    // get spring security creation options
    const optionsResponse = await post("/webauthn/register/options");

    // check error
    if (!optionsResponse.ok) {
        throw new Error("Failed to get creation options");
    }

    // parse json
    const optionsJson = await optionsResponse.json();

    // WebAuthn parsing support
    const pkCredCreationOptions =
        PublicKeyCredential.parseCreationOptionsFromJSON(optionsJson);

    // call navigator.credentials.create
    const credential = await navigator.credentials.create({
        publicKey: pkCredCreationOptions
    });

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
});
